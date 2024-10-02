import React, { useState, useEffect, useCallback } from "react";
import { GET_CAMPERS, GET_VOLUNTEERS, UPDATE_ALL_CAMPERS, UPDATE_ALL_VOLUNTEERS, handleApolloError } from '../gpl/index';
import { useLazyQuery, useMutation } from '@apollo/client';
import { CircularProgress, Typography, Box } from '@mui/material';
import { computeChecksum } from "../WebWorkers/webWorkerChecksum";


const REDIS_CAMPERS_KEY = 'admin-Cache-Campers';
const REDIS_VOLUNTEERS_KEY = 'admin-Cache-Volunteers';
const GRAPHQL_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes


export const CacheBrowserSideData = ({ onDataLoaded }) => {

  const [lastGraphQLUpdateTimestamp, setLastGraphQLUpdateTimestamp] = useState(null);
  const [cachedCampers, setCachedCampers] = useState(null);
  const [cachedVolunteers, setCachedVolunteers] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatedAssignments, setUpdatedAssignments] = useState({});
/////////////////////////////////////////////////////////////////////////////////////////////////
  const [fetchCampers] = useLazyQuery(GET_CAMPERS, {
    fetchPolicy: 'no-cache',
    onCompleted: async (result) => {
      try {
        if (result && result.getAllCampers) {
          console.log("result fetchAllCampers in CacheBrowserSideData: ", result)
          // format the results to work with the component client side
          await formatCampersForRedis(result)
        }
      } catch (err) {
        console.error('Error fetching or updating campers:', err);
      }
    },
    onError: (error) => handleApolloError(error, 'fetching getAllCampers')
  });
/////////////////////////////////////////////////////////////////////////////////////////////////
  const [fetchVolunteers] = useLazyQuery(GET_VOLUNTEERS, {
    fetchPolicy: 'no-cache',
    onCompleted: async (result) => {
      try {
        if (result && result.getAllVolunteers) {
          // format the results to work with the component client side
          const nonAdminVolunteers = result.getAllVolunteers.filter(volunteer => volunteer.volunteerType !== "Admin");
          console.log("nonAdminVolunteers: ", nonAdminVolunteers);
          await formatVolunteersForRedis(nonAdminVolunteers)
        }
      } catch (err) {
        console.error('Error fetching or updating volunteers:', err);
      }
    },
    onError: (error) => handleApolloError(error, 'fetching getAllVolunteers')
  });
/////////////////////////////////////////////////////////////////////////////////////////////////
  const [updateCampersInGraphQL] = useMutation(UPDATE_ALL_CAMPERS, {
    fetchPolicy: 'no-cache',
    onCompleted: async (result) => {
      try {
        if (result && result.updateAllCampers) {
          // format the results to work with the component client side
          await formatCampersForRedis(result.updateAllCampers)
        }
      } catch (err) {
        console.error('Error fetching or updating campers:', err);
      }
    },
    onError: (error) => handleApolloError(error, 'updating campers in GraphQL')
  });
/////////////////////////////////////////////////////////////////////////////////////////////////
  const [updateVolunteersInGraphQL] = useMutation(UPDATE_ALL_VOLUNTEERS, {
    fetchPolicy: 'no-cache',
    onCompleted: async (result) => {
      try {
        if (result && result.updateAllVolunteers) {
          // format the results to work with the component client side
          await formatVolunteersForRedis(result.updateVolunteers)
        }
      } catch (err) {
        console.error('Error fetching or updating volunteers:', err);
      }
    },
    onError: (error) => handleApolloError(error, 'updating volunteers in GraphQL')
  });
/////////////////////////////////////////////////////////////////////////////////////////////////
  const formatCampersForRedis = async (result) => {
    const reFormattedResults = result.getAllCampers.map((camper) => {
      let volunteerAssignments = [];

      if (camper.volunteerAssignments && 
          camper.volunteerAssignments.volunteerEmails && 
          camper.volunteerAssignments.volunteerType) {
          
          volunteerAssignments = camper.volunteerAssignments.volunteerEmails.map((volunteerEmail, index) => ({
              email: volunteerEmail,
              type: camper.volunteerAssignments.volunteerType[index],
              saved: true
          }));
      }

      return {
          ...camper,
          volunteerAssignments: volunteerAssignments
      };
    });
    // Update the state and cache in Redis
    // for (const camper of reFormattedResults) {
    //   if (camper.volunteerAssignments.length > 0) {
    //     setUpdatedAssignments(prev => ({
    //       ...prev,
    //       [camper.email]: camper.volunteerAssignments
    //     }));
    //   }
    // }
    await cacheData(reFormattedResults, REDIS_CAMPERS_KEY, setCachedCampers);
  };

  const fetchAndCacheData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await fetchCampers();
      await fetchVolunteers();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCampers, fetchVolunteers]);

  useEffect(() => {
    console.log('Fetching and caching data...');
    fetchAndCacheData();
    const intervalId = setInterval(fetchAndCacheData, GRAPHQL_UPDATE_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchAndCacheData]);

  useEffect(() => {
    if (cachedCampers && cachedVolunteers) {
      onDataLoaded({ campers: cachedCampers, volunteers: cachedVolunteers });
    }
  }, [cachedCampers, cachedVolunteers, onDataLoaded]);

  // formats the data from the database for our component properly save it to index db
const formatVolunteersForRedis = async (volunteers) => {
  const reFormattedResults = volunteers.map((volunteer) => {
      let volunteerAssignments = [];

      if (volunteer.volunteerAssignments && volunteer.volunteerAssignments.camperEmail) {
          volunteerAssignments = volunteer.volunteerAssignments.camperEmail.map((email) => ({
              email: email,
              type: "Camper", // You might want to adjust this if there are different types
              saved: true
          }));
      }

      return {
          ...volunteer,
          volunteerAssignments: volunteerAssignments
      };
  });
  // for (const volunteer of reFormattedResults) {
  //     await store.put(volunteer);
  //     if (volunteer.volunteerAssignments.length > 0) {
  //         setUpdatedAssignments(prev => ({
  //             ...prev,
  //             [volunteer.email]: volunteer.volunteerAssignments
  //         }));
  //     }
  // }
  await cacheData(reFormattedResults, REDIS_VOLUNTEERS_KEY, setCachedVolunteers);

};

const cacheData = async (newData, redisKey, setCacheFunction) => {
  try {
    // Compute new checksums:
    const newDataChecksum = await computeChecksum(newData);

    const getResponse = await fetch(`http://localhost:3000/api/redis/cache/${redisKey}`);
    if (!getResponse.ok) {
      throw new Error(`HTTP error while getting cache! status: ${getResponse.status}`);
    }
    const existingData = await getResponse.json();

    if (existingData && existingData.value && existingData.checksum) {
      // Compare checksums with existing data:
      if (existingData.checksum !== newDataChecksum) {
        console.log(`${redisKey} data differs. Performing incremental update...`);
        
        const updatedData = await performIncrementalUpdate(existingData.value, newData);
        
        if (redisKey === REDIS_CAMPERS_KEY) {
          // need to review the shape of this data, i dont know what shape the data being sent is in
          //await updateCampersInGraphQL({ variables: { campers: updatedData } });
          
        } else {
          //await updateVolunteersInGraphQL({ variables: { volunteers: updatedData } });
        }
        const updatedChecksum = await computeChecksum(updatedData);
        await updateRedisCache(updatedData, updatedChecksum, redisKey);
        // set the cache to state
        setCacheFunction(updatedData);
      } else {
        console.log(`${redisKey} data is identical. No update needed.`);
        return;
      }
    } else {
      await updateRedisCache(newData, newDataChecksum, redisKey);
       // set the cache to state
      setCacheFunction(newData);
    }

    setLastGraphQLUpdateTimestamp(Date.now());
  } catch (error) {
    console.error(`Error caching ${redisKey} data:`, error);
    setError(error.message);
  }
};

const performIncrementalUpdate = async (oldData, newData) => {
  const updatedData = oldData.filter(oldItem => 
    newData.some(newItem => newItem._id === oldItem._id)
  );

  for (const newItem of newData) {
    const index = updatedData.findIndex(item => item._id === newItem._id);
    if (index !== -1) {
      updatedData[index] = deepMerge(updatedData[index], newItem);
    } else {
      updatedData.push(newItem);
    }
  }
  return updatedData;
};

  const deepMerge = (target, source) => {
    const isObject = (obj) => obj && typeof obj === 'object';
  
    if (!isObject(target) || !isObject(source)) {
      return source;
    }
  
    Object.keys(source).forEach(key => {
      const targetValue = target[key];
      const sourceValue = source[key];
  
      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        if (key === 'volunteerAssignments') {
          // For volunteerAssignments, replace existing entries or add new ones
          target[key] = sourceValue.map(sourceItem => {
            const existingItem = targetValue.find(targetItem => targetItem.email === sourceItem.email);
            return existingItem ? { ...existingItem, ...sourceItem } : sourceItem;
          });
        } else {
          // For other arrays, replace the entire array
          target[key] = sourceValue;
        }
      } else if (isObject(targetValue) && isObject(sourceValue)) {
        target[key] = deepMerge(Object.assign({}, targetValue), sourceValue);
      } else {
        target[key] = sourceValue;
      }
    });
  
    return target;
  };

  const updateRedisCache = async (data, checksum, redisKey) => {

    const payload = JSON.stringify({ 
      value: data,
      checksum: checksum,
      expirationInSeconds: 3600
    });

    console.log(`Payload size for ${redisKey}:`, payload.length);

    try {
      const setResponse = await fetch(`http://localhost:3000/api/redis/cache/${redisKey}`, {
        method: "PUT",
        headers: { 
          'Content-Type': 'application/json',
          'Content-Length': payload.length.toString()
        },
        body: payload
      });
  
      if (!setResponse.ok) {
        throw new Error(`HTTP error while setting cache! status: ${setResponse.status}`);
      }
  
      const result = await setResponse.json();
      console.log(`Cache update result for ${redisKey}:`, result);
    } catch (error) {
      console.error(`Error updating Redis cache for ${redisKey}:`, error);
      throw error;
    }
  };



  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {isLoading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 1 }}>Loading data...</Typography>
        </Box>
      )}
      {error && <Typography color="error" sx={{ mt: 2 }}>Error: {error}</Typography>}
      {cachedCampers && cachedVolunteers && (
        <Typography sx={{ mt: 2 }}>Data loaded successfully!</Typography>
      )}
      {lastGraphQLUpdateTimestamp && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          Last updated: {new Date(lastGraphQLUpdateTimestamp).toLocaleString()}
        </Typography>
      )}
    </Box>
  );
};
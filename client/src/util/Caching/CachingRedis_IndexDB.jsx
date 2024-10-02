import React, { useState, useEffect, useCallback } from "react";
import { GET_CAMPERS, GET_VOLUNTEERS } from '../gpl';
import { openDB } from 'idb';
// fix up this component
const REDIS_KEY = 'admin-IndexDB';
const DB_NAME = 'STJDADB';
const CAMPERS_STORE = 'campers';
const VOLUNTEERS_STORE = 'volunteers';

const INDEXDB_UPDATE_INTERVAL = 2 * 60 * 1000; // 2 minutes
const GRAPHQL_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

const openSTJDADB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(CAMPERS_STORE)) {
        db.createObjectStore(CAMPERS_STORE, { keyPath: '_id' });
      }
      if (!db.objectStoreNames.contains(VOLUNTEERS_STORE)) {
        db.createObjectStore(VOLUNTEERS_STORE, { keyPath: '_id' });
      }
    },
  });
};

export const CacheBrowserSideData = ({
  getAllCampers,
  getAllVolunteers,
  onDataLoaded
}) => {
  const [lastGraphQLUpdateTimestamp, setLastGraphQLUpdateTimestamp] = useState(null);
  const [cachedData, setCachedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
// get the data from graphql and format it
const [getAllCampers, { loading, err, data }] = useLazyQuery(GET_CAMPERS,{
  fetchPolicy: 'no-cache',
  onCompleted: async (result) => {
      try {
          if (result && result.getAllCampers) {
              // the data goes off to be formated in this function
              await storeCampersInDB(result);
        }
      } catch (err) {
        console.error('Error fetching or updating campers:', err);
      }
    },
    onError: (error) => handleApolloError(error, 'fetching getAllCampers')
});

// formats the data from the database for our component properly save it to index db
const storeCampersInDB = async (result) => {
    
  const db = await openSTJDADB();
  const tx = db.transaction(CAMPERS_STORE, 'readwrite');
  const store = tx.objectStore(CAMPERS_STORE);

  await store.clear();
  // reformat the results of the incoming data so it matches up with our setup
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
  // set the state which updates the UI, and stores to indexDB
  for (const camper of reFormattedResults) {
      await store.put(camper);
      if (camper.volunteerAssignments.length > 0) {
          setUpdatedAssignments(prev => ({
              ...prev,
              [camper.email]: camper.volunteerAssignments
          }));
      }
  }
  await tx.done;
};



const cacheData = async (data) => {
    try {
        // Clear existing data
        const clearResponse = await fetch(`http://localhost:3000/api/redis/cache/${REDIS_KEY}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
                body: JSON.stringify({ value: null })
        });

        if (!clearResponse.ok) {
            throw new Error(`HTTP error while clearing cache! status: ${clearResponse.status}`);
        }

        // Set new data
        const setResponse = await fetch(`http://localhost:3000/api/redis/cache/${REDIS_KEY}`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            value: data,
            expirationInSeconds: 3600 // 1 hour expiration
        })
        });

        if (!setResponse.ok) {
            throw new Error(`HTTP error while setting cache! status: ${setResponse.status}`);
        }

        const result = await setResponse.json();
        console.log("Cache set result:", result);
    } catch (error) {
        console.error("Error caching data:", error);
        throw error;
    }
};

const getCachedData = async () => {
    try {
        const response = await fetch(`http://localhost:3000/api/redis/cache/${REDIS_KEY}`, {
        method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error while getting cache! status: ${response.status}`);
        }

        const result = await response.json();
        return result.value;
    } catch (error) {
        console.error("Error getting cached data:", error);
        return null;
    }
};

const loadFromDB = useCallback(async (reload = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const db = await openSTJDADB();

      // Check if data is stale (older than 1 hour)
      const currentTime = Date.now();
      const isStale = !lastUpdateTimestamp || (currentTime - lastUpdateTimestamp) > 3600000;

      if (reload || isStale) {
        // Fetch fresh data from GraphQL
        const campersData = await getAllCampers();
        const volunteersData = await getAllVolunteers();
        setLastUpdateTimestamp(currentTime);

        // Update Redis cache
        const allData = {
          campers: campersData,
          volunteers: volunteersData,
          lastUpdateTimestamp: currentTime
        };
        await cacheData(allData);

        // Store in IndexedDB
        await storeCampersInDB(campersData);
        await storeVolunteersInDB(volunteersData);
      } else {
        // Use cached data from Redis
        const cachedData = await getCachedData();
        if (cachedData) {
          await storeCampersInDB(cachedData.campers);
          await storeVolunteersInDB(cachedData.volunteers);
          setLastUpdateTimestamp(cachedData.lastUpdateTimestamp);
        } else {
          // If no cached data, fetch fresh data
          const campersData = await getAllCampers();
          const volunteersData = await getAllVolunteers();
          setLastUpdateTimestamp(currentTime);

          // Update Redis cache
          const allData = {
            campers: campersData,
            volunteers: volunteersData,
            lastUpdateTimestamp: currentTime
          };
          await cacheData(allData);

          // Store in IndexedDB
          await storeCampersInDB(campersData);
          await storeVolunteersInDB(volunteersData);
        }
      }

      // Notify parent component that data is loaded
      onDataLoaded();

    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
}, [lastUpdateTimestamp, getAllCampers, getAllVolunteers, storeCampersInDB, storeVolunteersInDB, onDataLoaded]);

  useEffect(() => {
    loadFromDB();
  }, [loadFromDB]);

  return (
    <div>
      <h1>Browser Cache</h1>
      {isLoading && <p>Loading data...</p>}
      {error && <p>Error: {error}</p>}
      <button onClick={() => loadFromDB(true)}>Reload Data</button>
    </div>
  );
};
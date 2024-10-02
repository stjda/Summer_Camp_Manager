import React, { useEffect, useState, useRef } from 'react';
import { Box, 
    TextField, 
    Button, 
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Checkbox, 
    CircularProgress, 
    IconButton, 
    Snackbar, 
    Select, 
    MenuItem,
    List,
    ListItemButton,
    ListItemText, 
    Typography} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import GetAppIcon from '@mui/icons-material/GetApp';
import SaveIcon from '@mui/icons-material/Save';
import { Trie } from '../../../util/textSearchTrie'
import { GET_CAMPERS, GET_VOLUNTEERS } from '../../../util/gpl/queries';
import { ADD_ASSIGNMENT, REMOVE_ASSIGNMENT } from '../../../util/gpl/mutations';
import { useLazyQuery, useMutation } from '@apollo/client';
import { openDB } from 'idb';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { handleApolloError } from '../../../util/gpl/handleApolloError';
// import { CacheBrowserSideData } from '../../../util/Caching/CachingGraphQL_Redis'
import * as XLSX from 'xlsx';

// setup index db to hold the database info client side
const DB_NAME = 'STJDADB';
const CAMPERS_STORE = 'campers';
const VOLUNTEERS_STORE = 'volunteers';

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

export const DirectSearch = () => {

    const StaffTrie = useRef(new Trie());
    const UserTrie = useRef(new Trie());
    const tableCellRef = useRef(null);
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]); // this is the camper data that the table is created from after searching
    const [staff, setStaff] = useState([]); // this is the staff data
    const [dropdownOptions, setDropdownOptions] = useState({})
    const [showDropdown, setShowDropdown] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [checkedRows, setCheckedRows] = useState({});
    const isAllChecked = Object.values(checkedRows).every(Boolean) && Object.keys(checkedRows).length > 0;
    const [staffEmails, setStaffEmails] = useState({});
    const [types, setStaffTypes] = useState({});
    const [isIndexDBLoading, setIsIndexDBLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [indexDBError, setIndexDBError] = useState(null);
    const [firstLoad, setFirstLoad] = useState(true)
    const [assignments, setAssignments] = useState({}); // handles the 'type' and the input feild for 'email' row from the table, we pull the 'type' and 'email' from it and put them in updatedAssignments for their respective assignemnt
    const [updatedAssignments, setUpdatedAssignments] = useState({}); // these are the volunteer assignemtns that are updated with indexDB and later used to update graphql
    const [removedAssignments, setRemovedAssignments] = useState([]);
    let isUnsaved = "";
    // GraphQL hook Mutations
const [performRemoveAssignment] = useMutation(REMOVE_ASSIGNMENT,{
        fetchPolicy: 'no-cache',
        onCompleted: (data) => {
            console.log('Assignment removed successfully:', data);
            setSnackbarMessage(`Assignment removed successfully!`);
            setSnackbarOpen(true);
        },
        onError: (error) => handleApolloError(error, 'fetching performRemoveAssignment')
    })
const [performSingleUpsert] = useMutation(ADD_ASSIGNMENT, {
        fetchPolicy: 'no-cache',
        onCompleted: (data) => {
            console.log('Assignment upserted successfully:', data);
            setSnackbarMessage(`New assignments saved successfully!`);
            setSnackbarOpen(true);
        },
        onError: (error) => handleApolloError(error, 'fetching performSingleUpsert')
    });
    // GraphQL hook Queries
const [getAllCampers, { loading, error, data }] = useLazyQuery(GET_CAMPERS,{
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
     // GraphQL hook Queries
const [getAllVolunteers, { loading: LoadVolunteer, error: VolunteerError, data: VolunteerData }] = useLazyQuery(GET_VOLUNTEERS, {
  fetchPolicy: 'no-cache',
  onCompleted: async (result) => {
    try {
        if (result && result.getAllVolunteers) {
            const nonAdminVolunteers = result.getAllVolunteers.filter(volunteer => volunteer.volunteerType !== "Admin");
            console.log("nonAdminVolunteers: ", nonAdminVolunteers);
            await storeVolunteersInDB(nonAdminVolunteers);
        }
    } catch (err) {
        console.error('Error fetching or updating volunteers:', err);
    }
    },
    onError: (error) => handleApolloError(error, 'fetching getAllVolunteers')
    });

useEffect(() => {
    console.log('Campers data updatedAssignments  ', updatedAssignments);
}, [updatedAssignments]);

// initial load up
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
// formats the data from the database for our component properly save it to index db
const storeVolunteersInDB = async (volunteers) => {
    const db = await openSTJDADB();
    const tx = db.transaction(VOLUNTEERS_STORE, 'readwrite');
    const store = tx.objectStore(VOLUNTEERS_STORE);
    
    await store.clear();

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

    for (const volunteer of reFormattedResults) {
        await store.put(volunteer);
        if (volunteer.volunteerAssignments.length > 0) {
            setUpdatedAssignments(prev => ({
                ...prev,
                [volunteer.email]: volunteer.volunteerAssignments
            }));
        }
    }
    
    await tx.done;
};

useEffect(() => {
    if (query.length > 0) {
        handleSearch(query);
    } else {
        setDropdownOptions([]);
        setShowDropdown(false);
    }
}, [query]);

// this use effect loads up index db by querying graphql, if indexdb is empty
useEffect(() => {
  loadFromDB(firstLoad);
}, []);

const loadFromDB = async (reload = false) => {
// later you might consider running a check, to load this if reload is true or if there is no STSJD data inside indexDB
    // this method does 4 things: in this order
        // 1) get all campers/volunteers, and their associated data from indexDB so they can be searched for using the TRIE data struct
        // 2) sets the updatedAssignments variable, with the most current indexDB data.
        // 3) on the initial load, or when indexDB is empty, it calls the database
        // 4) Manages the spinner for the loading screen
    setIsIndexDBLoading(true);
    setIndexDBError(null);
    try {
///////////////////////////////////////////////////////////////////////////////////////////////////////
        const db = await openSTJDADB();
        // 1) Function to get volunteerAssignments using cursor
        const getVolunteerAssignments = async (store) => {
            let assign = {};
            let cursor = await store.openCursor();
            while (cursor) {
                if (cursor.value.volunteerAssignments && cursor.value.volunteerAssignments.length > 0) {
                    assign[cursor.value.email] = cursor.value.volunteerAssignments;
                }
                cursor = await cursor.continue();
            }
            return assign;
        };

        const campersTx = db.transaction(CAMPERS_STORE, 'readonly');
        const campersStore = campersTx.objectStore(CAMPERS_STORE);
        const [campers, camperAssignments] = await Promise.all([
            campersStore.getAll(),
            getVolunteerAssignments(campersStore)
        ]);
        await campersTx.done;
        
        const volunteersTx = db.transaction(VOLUNTEERS_STORE, 'readonly');
        const volunteersStore = volunteersTx.objectStore(VOLUNTEERS_STORE);
        const [volunteers, volunteerAssignments] = await Promise.all([
            volunteersStore.getAll(),
            getVolunteerAssignments(volunteersStore)
        ]);
        await volunteersTx.done;
///////////////////////////////////////////////////////////////////////////////////////////////////////
        // 2) Combine the most current assignemnt data from indexDB
        const allVolunteerAssignments = { ...camperAssignments, ...volunteerAssignments };

        // Update the state with all assignments
        setUpdatedAssignments(allVolunteerAssignments);
///////////////////////////////////////////////////////////////////////////////////////////////////////
        // 3)use the campers store to set the search results
        if (campers.length > 0) {
            setSearchResults(campers); // add all the users to search results so we can filter the ones we want when checked
            
        } 
        
        if (volunteers.length > 0) {
            setStaff(volunteers);
            setSearchResults(volunteers)
        } 
 
        if(reload){
            // first load, or indexdb is empty
            await getAllCampers();
            // first load, or indexdb is empty
            await getAllVolunteers();
            // after the first load, set to false
            setFirstLoad(false);
        }
           
///////////////////////////////////////////////////////////////////////////////////////////////////////
       // 4) Manage the spinner: Add a random delay between 1.5 and 2.5 seconds
        const randomDelay = Math.random() * (2500 - 1500) + 1500; // Random number between 1500 and 2500
        await new Promise(resolve => setTimeout(resolve, randomDelay));

        setIsIndexDBLoading(false);
    } catch (err) {
        console.error('Error loading data from IndexedDB:', err);
        setIndexDBError(err.message);
        
        // Add a random delay between 1.5 and 2.5 seconds
        const randomDelay = Math.random() * (2500 - 1500) + 1500; // Random number between 1500 and 2500
        await new Promise(resolve => setTimeout(resolve, randomDelay));
        
        setIsIndexDBLoading(false);
        await getAllCampers();
        await getAllVolunteers();
    }
};

const getIcon = (type) => {
    switch (type) {
      case 'Doctor':
        return <LocalHospitalIcon />;
      case 'Counselor':
        return <PsychologyIcon />;
      case 'Phys Trainer':
        return <FitnessCenterIcon />;
      case 'Administrator':
        return <GroupIcon />;
      case 'Nurse':
        return <LocalHospitalIcon />;
      default:
        return <PersonIcon />;
    }
  };
////////////////////Manages the search bar
const handleSearch = async (searchTerm, isRefresh = false) => {

    try {
        const STORE_NAME = searchTerm.startsWith("staff") ? VOLUNTEERS_STORE : CAMPERS_STORE;
        const db = await openSTJDADB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        
        const items = await store.getAll();
        const completions = trieCompletions(items, searchTerm);

        // Process the completions
        const options = completions.map(completion => ({
            label: completion.data.message || completion.word,
            value: completion.data
        }));

        // Update dropdown options
        setDropdownOptions(options);
        if(!isRefresh){
            setShowDropdown(true);
        }
    } catch (error) {
        console.error("Error in handleSearch:", error);
    } 
};
////////////////////
const trieCompletions = (data, query) => {  // the trie data structure carries all the data for the search results
    const searchAll = query.split(":").map(item => item.trim());
    const trieToUse = searchAll[0].toLowerCase() === "staff" ? StaffTrie : 
                      searchAll[0].toLowerCase() === "user" ? UserTrie : null;
    
    if (!trieToUse) {
        if(query == "All entries"){
            setShowDropdown(false);
        }else{
            return [{
                word: "Invalid search format",
                data: {
                    message: "Please use the format 'user:<search>' or 'staff:<search>' to begin your search."
                }
            }];
        }
    
    }

        if (searchAll.length < 2 || searchAll[1].trim() === "") {
            return [{
                word: "Incomplete search",
                data: {
                    message: `Please enter a search term after '${searchAll[0]}:'`
                }
            }];
        }
    
        // Clear the trie before populating
        trieToUse.current = new Trie();
    
        const searchTerm = searchAll.slice(1).join(" ").toLowerCase();
    
        data.forEach(item => {
            if (item.email) {
                trieToUse.current.insert(item.email.toLowerCase(), item);
            }
            if (item.firstName) {
                trieToUse.current.insert(item.firstName.toLowerCase(), item);
            }
            if (item.lastName) {
                trieToUse.current.insert(item.lastName.toLowerCase(), item);
            }
            if (item.firstName && item.lastName) {
                trieToUse.current.insert(`${item.firstName.toLowerCase()} ${item.lastName.toLowerCase()}`, item);
                trieToUse.current.insert(`${item.lastName.toLowerCase()} ${item.firstName.toLowerCase()}`, item);
            }
            if (item.item) {
                trieToUse.current.insert(item.item.toLowerCase(), item);
            }
        });
    
        // Check if the query is for all entries
        if (searchTerm === "all") {
            return [{
                word: "All entries",
                data: data // this is the data assiciated with the search
            }];
        }
    
    // Return the completions, finds whole matches
    const completions = trieToUse.current.findCompletions(searchTerm);
    
    // If no completions found, return a message
    if (completions.length === 0) {
        return [{
            word: "No results",
            data: {
                message: `No results found for '${searchTerm}'. Please try a different search term.`
            }
        }];
    }

    return completions.map(completion => ({
        word: completion.word,
        data: completion.data || completion
    }));
};
//////////////////////////
const handleOptionSelect = (option) => {
    // the
    setShowDropdown(false);
    
    if(option.value.message === "Please use the format 'user:<search>' or 'staff:<search>' to begin your search."){
        setDropdownOptions([]);
    // Clear the query and any previous message
        return;
    }
    // Construct the table
    constructTheTable(option);
    
    // Clear the query and any previous messages
    setDropdownOptions([]);
};
////////////////////
const constructTheTable = (option) => {
    // the option parameter is the selection data from the Trie data struct
   
    setShowResults(false);
    
    try {
        // this is an array of values or a single the specified search target place into an array
        let results = Array.isArray(option.value) ? option.value : [option.value]; 
        let formattedResults = results.map(result => {
            if (!result || typeof result !== 'object') {
                console.error('Unexpected result format:', result);
                return null;
            }
       
            if (result.__typename === 'Volunteer') {
                return {
                    id: result._id,
                    firstName: result.firstName,
                    lastName: result.lastName,
                    __typename: 'Volunteer',
                    volunteerType: result.volunteerType || 'Not Assigned',
                    volunteerAssignments: result.volunteerAssignments || [],
                    email: result.email,
                    phone: result.phone,
                    notes: result.notes || 'No notes',
                    
                };
            } else if (result.__typename === 'Camper') {
                return {
                    id: result._id,
                    firstName: result.firstName,
                    lastName: result.lastName,
                    __typename: 'Camper',
                    careData: {
                        email: result.email || 'N/A',
                        lastKnownBG: result.careData?.lastKnownBG || 'N/A',
                        mdi: result.careData?.mdi || 'N/A',
                    
                    },
                    volunteerAssignments: result.volunteerAssignments || [],
                    email: result.email,
                    phone: result.phone,
                    notes: result.notes || 'No notes',
                    
                };
            } else {
                console.error('Unknown data type:', result);
                return {
                    id: result._id || 'unknown',
                    firstName: result.firstName || 'Unknown',
                    lastName: result.lastName || 'Unknown',
                    __typename: result.__typename || 'Unknown',
                    email: result.email || 'N/A',
                    phone: result.phone || 'N/A',
                    notes: result.notes || 'No notes'
                };
            }
        }).filter(result => result !== null);

        if (formattedResults.length === 0) {
            throw new Error('No valid results to display');
        }

        setSearchResults(formattedResults);
        setShowResults(true);
        setCheckedRows(formattedResults.reduce((acc, row) => ({...acc, [row.id]: false}), {}));
        setStaffEmails(formattedResults.reduce((acc, row) => ({...acc, [row.id]: ''}), {}));
        setStaffTypes(formattedResults.reduce((acc, row) => ({...acc, [row.id]: ''}), {}));
    } catch (error) {
        console.error("Error constructing table:", error);
        setSnackbarMessage('Error constructing table. Please try again.');
        setSnackbarOpen(true);
    } 
};
////////////////////
const handleClose = () => {
    setShowResults(false);
    setSearchResults([]);
    setCheckedRows({});
    setStaffEmails({});
};
////////////////////
const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
        return;
    }
    setSnackbarOpen(false);
};
////////////////////
const checkForUnsavedChanges = () => {
    return removedAssignments.length > 0 || 
           Object.values(updatedAssignments).some(assignments => 
               Array.isArray(assignments) && assignments.length > 0 && 
               assignments.some(assignment => assignment?.saved === false)
           );
};
////////////////////
const handleCheckAll = (event) => {
    const newCheckedRows = Object.keys(checkedRows).reduce((acc, key) => ({
        ...acc,
        [key]: event.target.checked
    }), {});
    setCheckedRows(newCheckedRows);
};
////////////////////
const handleCheckRow = (id) => (event) => {
    setCheckedRows(prev => ({ ...prev, [id]: event.target.checked }));
};
////////////////////////////
const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
};
///////////////////////////
////////////////////this is for the dropdown change of volunteer type: (doctor, nurse, etc.) & for the email: <email>
const handleAssignmentChange = (rowId, field) => (event) => {
    setAssignments(prev => ({
        ...prev,
        [rowId]: { ...prev[rowId], [field]: event.target.value }
    }));
};
////////////////////this handles updating indexDB to match the updates made by the user, and also updates the react state
const handleAssignRemoveStaff = async (rowId, action) => {
    const email = assignments[rowId]?.email;// this is the email that was input into the text feild.
    if (!email) {
        setSnackbarMessage('Please enter a valid email address.');
        setSnackbarOpen(true);
        return;
    }
    const type = assignments[rowId]?.type || ''; // this is the type of volunteer selected from the dropdown

    try {
        const db = await openSTJDADB();
        const tx = db.transaction([VOLUNTEERS_STORE, CAMPERS_STORE], 'readwrite');
        const volunteersStore = tx.objectStore(VOLUNTEERS_STORE);
        const campersStore = tx.objectStore(CAMPERS_STORE);

        // Function to check which value in either indexDB store has the email that was type into the text feild by the user
        const checkEmailInStore = async (store) => {
            let cursor = await store.openCursor();
            while (cursor) {
                if (cursor.value.email === email) {
                    return cursor.value;
                }
                cursor = await cursor.continue();
            }
            return null;
        };

        // Check both stores for the email
        const volunteerRecord = await checkEmailInStore(volunteersStore);
        const camperRecord = await checkEmailInStore(campersStore);

        if (!volunteerRecord && !camperRecord) {
            setSnackbarMessage(`Email ${email} not found in the database.`);
            setSnackbarOpen(true);
            await tx.done;
            return;
        }

        const assignedRecord = volunteerRecord || camperRecord; // whichever one of these is assigned, will be the indexDB that corresponds to the email input through the text feild
        const finalStaffType = type; // type is the volunteer type selected from the dropdown menu
        
        // Which db to update? The one which matches the typename of the rowId we are working with
        const targetStoreName = searchResults.find(row => row.id === rowId).__typename === 'Volunteer' ? VOLUNTEERS_STORE : CAMPERS_STORE;
        const targetStore = tx.objectStore(targetStoreName);
        const targetRecord = await targetStore.get(rowId); // which row do we update inside indexDB? the row that matches the rowId of the line we are updating.

        if (targetRecord && assignedRecord) {
            if (action === 'add') {

                // Check for self-assignment and same type assignment
                if (targetRecord.email === email) {
                    setSnackbarMessage(`Cannot assign ${email} to themselves!`);
                    setSnackbarOpen(true);
                    await tx.done;
                    return;
                }

                // Check if both records are of the same type (both volunteers or both campers)
                if (targetRecord.__typename === assignedRecord.__typename) {
                    setSnackbarMessage(`Cannot assign ${targetRecord.__typename} to another ${targetRecord.__typename}!`);
                    setSnackbarOpen(true);
                    return;
                }
                
                // Check if the assignment already exists for the target record
                const targetAssignmentExists = Array.isArray(targetRecord.volunteerAssignments) &&
                    targetRecord.volunteerAssignments.some(assignment => assignment.email === assignedRecord.email);

                // Check if the assignment already exists for the assigned record
                const assignedAssignmentExists = Array.isArray(assignedRecord.volunteerAssignments) &&
                    assignedRecord.volunteerAssignments.some(assignment => assignment.email === targetRecord.email);

                if (targetAssignmentExists || assignedAssignmentExists) {
                    setSnackbarMessage(`Assignment already exists for ${email}!`);
                    setSnackbarOpen(true);
                    await tx.done;
                    return;
                }
                // Update target record: target record is the record we want to update
                let targetNewAssignments = Array.isArray(targetRecord.volunteerAssignments) 
                    ? [...targetRecord.volunteerAssignments, { email: assignedRecord.email, type: (targetRecord.__typename === "Volunteer" ? "Camper" : finalStaffType), saved: false }]
                    : [{ email: assignedRecord.email, type: (targetRecord.__typename === "Volunteer" ? "Camper" : finalStaffType), saved: false }];
                
                targetRecord.volunteerAssignments = targetNewAssignments;
                await targetStore.put(targetRecord);

                // Update assigned record: assigned record is the input in the text feild
                let assignedNewAssignments = Array.isArray(assignedRecord.volunteerAssignments)
                    ? [...assignedRecord.volunteerAssignments, { email: targetRecord.email, type: (targetRecord.__typename === "Volunteer" ? finalStaffType : "Camper"), saved: false }]
                    : [{ email: targetRecord.email, type: (targetRecord.__typename === "Volunteer" ? finalStaffType : "Camper"), saved: false }];
                
                assignedRecord.volunteerAssignments = assignedNewAssignments;
                await (assignedRecord.__typename === 'Volunteer' ? volunteersStore : campersStore).put(assignedRecord);

                // Clear the input box after successful addition
                setAssignments(prev => ({
                    ...prev,
                    [rowId]: { ...prev[rowId], email: '', type: '' }
                }));
                
                setSnackbarMessage(`Record ${email} assigned successfully!`);

            } else if (action === 'remove') {
                // Check if the assignment exists before attempting to remove
                const targetAssignmentExists = Array.isArray(targetRecord.volunteerAssignments) &&
                    targetRecord.volunteerAssignments.some(assignment => assignment.email === assignedRecord.email);

                const assignedAssignmentExists = Array.isArray(assignedRecord.volunteerAssignments) &&
                    assignedRecord.volunteerAssignments.some(assignment => assignment.email === targetRecord.email);

                if (!targetAssignmentExists || !assignedAssignmentExists) {
                    setSnackbarMessage(`Assignment for ${email} does not exist!`);
                    setSnackbarOpen(true);
                    await tx.done;
                    return;
                }

                 // Add to removedAssignments state
                 // swap the targetRecord.email depending on which table is being used
                 if(targetRecord.__typename === "Camper"){
                     setRemovedAssignments(prev => [...prev, { camperEmail: targetRecord.email, volunteerEmail: email }]);
                 }else{
                     setRemovedAssignments(prev => [...prev, { camperEmail: email, volunteerEmail: targetRecord.email }]);
                 }
                
                // Remove assignment from target record
                targetRecord.volunteerAssignments = Array.isArray(targetRecord.volunteerAssignments)
                    ? targetRecord.volunteerAssignments.filter(v => v.email !== email)
                    : [];
                await targetStore.put(targetRecord);

                // Remove assignment from assigned record
                assignedRecord.volunteerAssignments = Array.isArray(assignedRecord.volunteerAssignments)
                    ? assignedRecord.volunteerAssignments.filter(v => v.email !== targetRecord.email)
                    : [];
                await (assignedRecord.__typename === 'Volunteer' ? volunteersStore : campersStore).put(assignedRecord);

                // Clear the input box after successful removal
                setAssignments(prev => ({
                    ...prev,
                    [rowId]: { ...prev[rowId], email: '', type: '' }
                }));

                setSnackbarMessage(`Record ${email} removed successfully!`);
            }
            
            // Updates the UI: and put the updates into their own state
            setSearchResults(prevResults => {
                const updatedResults = prevResults.map(row => {
                    if (row.id === rowId) {
                        // set only the updated elements to the state variable 
                        setUpdatedAssignments(prev => ({
                            ...prev,
                            [targetRecord.email]: targetRecord.volunteerAssignments,
                            [assignedRecord.email]: assignedRecord.volunteerAssignments,
                        }));
                        return {...row, volunteerAssignments: [...targetRecord.volunteerAssignments]};
                    }
                    return {...row};
                });
                return updatedResults;
            });

        } else {
            setSnackbarMessage(`Error: Record not found for ${email}`);
            setSnackbarOpen(true);
        }

        await tx.done;
    } catch (error) {
        console.error('Error in handleAssignRemoveStaff:', error);
        setSnackbarMessage(`An error occurred: ${error.message}`);
        setSnackbarOpen(true);
    }
};

const saveUpdates = async () => {
    // Check if there are any updates to process
    if (!checkForUnsavedChanges()) {
        setSnackbarMessage(`There are no new records to update.`);
        setSnackbarOpen(true);
        return;
    }
    
    console.log("saveUpdates function called: ", JSON.stringify(updatedAssignments));

    try {
        const upsertPromises = [];
        const removePromises = [];
        setIsProcessing(true);  // Indicate that processing has started

        // Process upserts if there are any updated assignments
        if (Object.keys(updatedAssignments).length > 0) {
            // Restructure the updatedAssignments object into a flat array
            const assignments = Object.entries(updatedAssignments).flatMap(([key, value]) => 
                value.map(assignment => ({
                    ...assignment,
                    originalKey: key
                }))
            );
            
            console.log("Restructured assignments: ", JSON.stringify(assignments));
        
            // Create a nested map structure: Map<CamperEmail, Map<VolunteerEmail, VolunteerType>>
            const relationshipMap = new Map();

            // Populate the relationshipMap
            assignments.forEach(assignment => {
                if (assignment.type === 'Camper') {
                    if (!relationshipMap.has(assignment.email)) {
                        relationshipMap.set(assignment.email, new Map());
                    }
                    const volunteerEmail = assignment.originalKey;
                    const volunteer = assignments.find(a => 
                        a.email === volunteerEmail && 
                        a.type !== 'Camper' && 
                        a.originalKey === assignment.email
                    );
                    if (volunteer) {
                        relationshipMap.get(assignment.email).set(volunteerEmail, volunteer.type);
                    }
                }
            });

            // Create upsert promises
            for (const [camperEmail, volunteerMap] of relationshipMap) {
                for (const [volunteerEmail, volunteerType] of volunteerMap) {
                    upsertPromises.push(
                        performSingleUpsert({
                            variables: { camperEmail, volunteerEmail, volunteerType }
                        })
                    );
                }
            }
        }
        console.log("removedAssignments: ", removedAssignments);
        // Process removals if there are any assignments to remove
        if (removedAssignments.length > 0) {
            for (const { camperEmail, volunteerEmail, type } of removedAssignments) {
                removePromises.push(
                    performRemoveAssignment({
                        variables: { camperEmail, volunteerEmail, type }
                    })
                );
            }
        }

        // Perform mutations in batches
        const batchSize = 3;
        let successCount = 0;
        let failureCount = 0;

        // Function to process a batch of promises
        const processBatch = async (promises) => {
            for (let i = 0; i < promises.length; i += batchSize) {
                const batch = promises.slice(i, i + batchSize);
                const batchResults = await Promise.all(batch);
                
                batchResults.forEach(result => {
                    if (result && !result.error) {
                        successCount++;
                    } else {
                        failureCount++;
                    }
                });

                // Wait for 1 second before processing the next batch
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        };

        // Process upserts and removals
        await processBatch(upsertPromises);
        await processBatch(removePromises);

        // Check if any operations were performed
        if (upsertPromises.length === 0 && removePromises.length === 0) {
            console.warn('No valid camper-volunteer pairs found.');
            setSnackbarMessage('No valid camper-volunteer pairs found.');
            setSnackbarOpen(true);
            return;
        }

        // Display results
        setSnackbarMessage(`Updates completed. Successful: ${successCount}, Failed: ${failureCount}`);
        setSnackbarOpen(true);

        // Clean up and refresh
        setQuery('');
        handleClose();
        await loadFromDB(true);
        
        // Clear the removedAssignments and updatedAssignments after processing
        setRemovedAssignments([]);
        setUpdatedAssignments({});
        
    } catch (error) {
        console.error('Error in processing assignments:', error);
        setSnackbarMessage(`An error occurred while processing assignments.`);
        setSnackbarOpen(true);
    } finally {
        setIsProcessing(false);  // Indicate that processing has finished
    }
};

const exportToExcel = () => {
    const checkedData = searchResults.filter(row => checkedRows[row.id]);
        // If no rows are checked, show an alert and return
    if (checkedData.length === 0) {
        setSnackbarMessage("Please select at least one row to export.");
        setSnackbarOpen(true);
        return;
    }

            // Format the data for export
    const dataToExport = checkedData.map(row => ({
        ID: row.id,
        Name: `${row.firstName} ${row.lastName}`,
        Email: row.email || 'N/A',
        Type: row.__typename,
        'Last BG': row.__typename === 'Camper' ? (row.careData?.lastKnownBG || 'N/A') : 'N/A',
        MDI: row.__typename === 'Camper' ? (row.careData?.mdi === true ? 'Yes' : 'No') : 'N/A',
        'Assigned Staff/Camper': row.volunteerAssignments ? row.volunteerAssignments.join(', ') : 'None',
        Notes: row.notes || 'No notes'
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Search Results");

    XLSX.writeFile(workbook, "SearchResults.xlsx");
};

    const handleCopy = (row) => {
        const textToCopy = `Camper ID: ${row.camperId}, Email: ${row.email}, Last Blood Glucose: ${row.bloodGlucose}, MDI: ${row.mdi}, Doctor: ${row.doctor}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setSnackbarMessage('Row data copied to clipboard!');
            setSnackbarOpen(true);
        }, (err) => {
            console.error('Could not copy text: ', err);
            setSnackbarMessage('Failed to copy. Please try again.');
            setSnackbarOpen(true);
        });
    };

    return (
        <Box sx={{ flexGrow: 1, padding: 2 }}>
            {isProcessing || isIndexDBLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </Box>
            ) : indexDBError ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <Typography color="error">Error loading data: {indexDBError}</Typography>
                </Box>
            ) : (
                <>
                    <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2, position: 'relative' }}>
                        <TextField
                            label="Search..."
                            variant="outlined"
                            value={query}
                            onChange={handleInputChange}
                            sx={{ marginRight: 1, flexGrow: 1 }}
                        />
                        <SearchIcon />

                        {/* <CacheBrowserSideData/> */}

                        {showDropdown && (
                            <Paper 
                                sx={{ 
                                    position: 'absolute', 
                                    top: '100%', 
                                    left: 0, 
                                    right: 0, 
                                    zIndex: 1,
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                }}
                            >
                                <List dense>
                                    {dropdownOptions.slice(0, 20).map((option, index) => (
                                        <ListItemButton
                                            key={index}
                                            onClick={() => handleOptionSelect(option)}
                                        >
                                            <ListItemText primary={option.label} />
                                        </ListItemButton>
                                    ))}
                                </List>
                            </Paper>
                        )}
                    </Box>
    
                    {showResults && (
                        <>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    startIcon={<GetAppIcon />} 
                                    onClick={exportToExcel}
                                >
                                    Export Checked to Excel
                                </Button>
                                <Button 
                                    variant="contained" 
                                    color="secondary" 
                                    startIcon={<SaveIcon />} 
                                    onClick={saveUpdates}
                                >
                                    Save Updates
                                </Button>
                                <IconButton onClick={handleClose} color="error">
                                    <CloseIcon />
                                </IconButton>
                            </Box>
    
                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 650 }} aria-label="search results table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    color="primary"
                                                    indeterminate={!isAllChecked && Object.values(checkedRows).some(Boolean)}
                                                    checked={isAllChecked}
                                                    onChange={handleCheckAll}
                                                />
                                            </TableCell>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Email</TableCell>
                                            {query.toLowerCase().startsWith('staff') ?
                                             <TableCell> -- </TableCell> : <TableCell>Last BG</TableCell>}
                                            {query.toLowerCase().startsWith('staff') ?
                                            <TableCell> -- </TableCell> : <TableCell>MDI</TableCell>}
                                            <TableCell>Assigned Staff/Camper</TableCell>
                                            <TableCell>Assign/Remove Staff</TableCell>
                                            <TableCell>Copy</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {searchResults.map((row) => (
                                            <TableRow key={row.id}>
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        color="primary"
                                                        checked={checkedRows[row.id] || false}
                                                        onChange={handleCheckRow(row.id)}
                                                    />
                                                </TableCell>
                                                <TableCell>{row.id}</TableCell>
                                                <TableCell>{`${row.firstName == null ? "-" : row.firstName} ${row.lastName == null ? "-" : row.lastName}`}</TableCell>
                                                <TableCell>{row.__typename === 'Camper' ? (row.email || 'N/A') : (row.email || 'N/A')}</TableCell>
                                                <TableCell>{row.__typename === 'Camper' ? (row.careData?.lastKnownBG || 'N/A') : 'N/A'}</TableCell>
                                                <TableCell>{row.__typename === 'Camper' ? (row.careData?.mdi === true ? 'Yes' : 'No') : 'N/A'}</TableCell>
                                               <TableCell ref={tableCellRef}> {/* if the volunteerAssignment is not saved it will show up red */}
                                                    {Array.isArray(row.volunteerAssignments) 
                                                        ? row.volunteerAssignments.map((assignment, index) => {
                                                            const updatedAssignment = updatedAssignments[row.email]?.find(a => a.email === assignment.email);
                                                            isUnsaved = updatedAssignment && !updatedAssignment.saved;
                                                            return (
                                                                <Box 
                                                                    key={index} 
                                                                    className={`assignment-box ${isUnsaved ? 'unsaved' : 'saved'}`}
                                                                    sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                                                                >
                                                                    <span style={{ color: isUnsaved ? 'red' : 'inherit' }}>{assignment.email}</span>
                                                                    {getIcon(assignment.type)}
                                                                </Box>
                                                            );
                                                        })
                                                        : 'None'}
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => handleAssignRemoveStaff(row.id, 'add')}
                                                            sx={{ mr: 1 }}
                                                        >
                                                            +
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => handleAssignRemoveStaff(row.id, 'remove')}
                                                            sx={{ mr: 1 }}
                                                        >
                                                            -
                                                        </Button>
                                                        <TextField
                                                            size="small"
                                                            value={assignments[row.id]?.email || ''}
                                                            onChange={handleAssignmentChange(row.id, 'email')}
                                                            placeholder="Enter email"
                                                            style={{ minWidth: 100, marginRight: 8 }}
                                                        />
                                                        <Select
                                                            value={assignments[row.id]?.type || ''}
                                                            onChange={handleAssignmentChange(row.id, 'type')}
                                                            displayEmpty
                                                            size="small"
                                                            sx={{ minWidth: 120 }}
                                                        >
                                                            <MenuItem value="" disabled>Type</MenuItem>
                                                            <MenuItem value="Doctor">Doctor</MenuItem>
                                                            <MenuItem value="Nurse">Nurse</MenuItem>
                                                            <MenuItem value="Counselor">Counselor</MenuItem>
                                                            <MenuItem value="Administrator">Administrator</MenuItem>
                                                            <MenuItem value="Phys Trainer">Phys Trainer</MenuItem>
                                                            
                                                        </Select>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton onClick={() => handleCopy(row)}>
                                                        <ContentCopyIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
    
                    <Snackbar
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        open={snackbarOpen}
                        autoHideDuration={3000}
                        onClose={handleSnackbarClose}
                        message={snackbarMessage}
                        action={
                            <IconButton
                                size="small"
                                aria-label="close"
                                color="inherit"
                                onClick={handleSnackbarClose}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        }
                    />
                </>
            )}
        </Box>
    )};
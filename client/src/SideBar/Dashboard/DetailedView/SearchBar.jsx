import React, { useState, useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
    Box, 
    TextField, 
    Typography, 
    Button, 
    IconButton, 
    Snackbar, 
    CircularProgress,
    Paper, 
    List,
    ListItemButton,
    ListItemText,
} from '@mui/material';
import { openDB } from 'idb';
import { handleApolloError } from '../../../util/gpl/handleApolloError';
import { GET_CAMPERS } from '../../../util/gpl/queries';
import { useLazyQuery, useMutation } from '@apollo/client';
import { Trie } from '../../../util/textSearchTrie'; 
import SearchIcon from '@mui/icons-material/Search';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloseIcon from '@mui/icons-material/Close';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { UserAccordion } from './Search/UserAccordian';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Fake data
const fakeData = [
    {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        __typename: 'Camper',
        careData: {
            lastKnownBG: 120,
            mdi: true
        },
        volunteerAssignments: [
            { email: 'staff1@example.com' },
            { email: 'staff2@example.com' }
        ]
    },
    {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        __typename: 'Camper',
        careData: {
            lastKnownBG: 110,
            mdi: false
        },
        volunteerAssignments: [
            { email: 'staff3@example.com' }
        ]
    },
    {
        id: 3,
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        __typename: 'Staff',
        careData: null,
        volunteerAssignments: []
    }
];

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
// this component is the Search bar for each user group
export const SearchGrid = observer(() => {

    const UserTrie = useRef(new Trie());
    const [indexDBError, setIndexDBError] = useState(null);
    const [isIndexDBLoading, setIsIndexDBLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [query, setQuery] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [checkedItems, setCheckedItems] = useState({});
    const [searchResults, setSearchResults] = useState();
    const [showResults, setShowResults] = useState(false);
    const [firstLoad, setFirstLoad] = useState(true)
    const [gridData, setGridData] = useState({});
    const [updatedAssignments, setUpdatedAssignments] = useState({});
    const [dropdownOptions, setDropdownOptions] = useState({})
    const [showDropdown, setShowDropdown] = useState(false);
    const graphRef = useRef(null);
    
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

useEffect(() => {
    console.log(query)
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

        // 2) Combine the most current assignemnt data from indexDB
        const allVolunteerAssignments = { ...camperAssignments };
        // Update the state with all assignments
        setUpdatedAssignments(allVolunteerAssignments);
        // 3)use the campers store to set the search results
        if (campers.length > 0) {
           // setSearchResults(campers); // add all the users to search results so we can filter the ones we want when checked
        }
        if(reload){
            // first load, or indexdb is empty
            await getAllCampers();
            // after the first load, set to false
            setFirstLoad(false);
        }    
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
    }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////
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
////////////////////Manages the search bar
const handleSearch = async (searchTerm, isRefresh = false) => {

    try {
        const STORE_NAME = CAMPERS_STORE;
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
///////////////////////////////////////////////////////////////////////////////////////////////////////
const trieCompletions = (data, query) => {  // the trie data structure carries all the data for the search results
    const searchAll = query.split(":").map(item => item.trim());
    const trieToUse = searchAll[0].toLowerCase() === "user" ? UserTrie : null;
    
    if (!trieToUse) {
        if(query == "All entries"){
            setShowDropdown(false);
        }else{
            return [{
                word: "Invalid search format",
                data: {
                    message: "Please use the format 'user:<search>' to begin your search."
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
            if (item.lastName) {
                trieToUse.current.insert(item.lastName.toLowerCase(), item);
            }
            if (item.firstName && item.lastName) {
                trieToUse.current.insert(`${item.firstName.toLowerCase()} ${item.lastName.toLowerCase()}`, item);
                trieToUse.current.insert(`${item.lastName.toLowerCase()} ${item.firstName.toLowerCase()}`, item);
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
///////When this runs it pulls up the accordian//////////////////////////////////////////////////////////
const handleOptionSelect = (option) => {
    // the
    setShowDropdown(false);
    
    if(option.value.message === "Please use the format 'user:<search>' to begin your search."){
        setDropdownOptions([]);
    // Clear the query and any previous message
        return;
    }
    // Construct the table with the userdata being passed
    constructTheTable(option);


    // Clear the query and any previous messages
    setDropdownOptions([]);
    setQuery('');  // Clear the search input after selection
};
///////////////////////////////////////////////////////////////////////////////////////////////////////
const constructTheTable = (searchData) =>{
    console.log("searchData", searchData.value)
    
    // shape the data here to fit into your setup

    try{
        // This does three things: on the first search, wraps the object in an array, 
        // the subsequent searches its already and arry, so it sets it proper in the first if()
        // a) If searchData.value is already an array, it uses it as is.
        // b) If searchData.value is a single object, it wraps it in an array.
        // c) If searchData.value is neither an array nor an object, it sets an empty array.
        if (Array.isArray(searchData.value)) {
            setSearchResults(searchData.value);
        } else if (searchData.value && typeof searchData.value === 'object') {
            setSearchResults([searchData.value]);
        } else {
            setSearchResults([]);
        }
        setShowResults(true);
    }catch(error){
        console.error("error in constructTheTable", error)
    }

}
///////////////////////////////////////////////////////////////////////////////////////////////////////
const handleCheckboxChange = (firstName, lastName, email, isChecked) => {
    const key = `${firstName} - ${lastName} ${email}`;
    setCheckedItems(prev => ({
        ...prev,
        [key]: isChecked
    }));
};
///////////////////////////////////////////////////////////////////////////////////////////////////////
const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
};

const handleCheckAll = (isChecked) => {
    const newCheckedItems = {};
    searchResults.forEach(row => {
        const key = `${row.firstName} - ${row.lastName} ${row.email}`;
        newCheckedItems[key] = isChecked;
    });
    setCheckedItems(newCheckedItems);
};

const handleDataChange = (userId, newData) => {
    console.log('New data:', newData);
    console.log('Readings:', newData.readings);
    console.log('Data structure:', JSON.stringify(newData, null, 2));
    console.log("checkedItems: ",  checkedItems)
    setGridData(prevData => ({
        ...prevData,
        [userId]: newData
    }));
};


const handleClose = () => {
    setShowResults(false);
};

const handleSnackbarClose = () => {
    setSnackbarOpen(false);
};

const handleCopy = (row) => {
    navigator.clipboard.writeText(JSON.stringify(row));
    setSnackbarMessage('Copied to clipboard');
    setSnackbarOpen(true);
};

    const exportToPDF = async () => {
        const doc = new jsPDF();
        
        // Set font and colors
        doc.setFont("helvetica");
        doc.setTextColor(44, 62, 80); // Dark blue color
    
        // Add title
        doc.setFontSize(22);
        doc.text("User Data Report", 105, 15, null, null, "center");
        
        // Add date
        doc.setFontSize(10);
        doc.setTextColor(149, 165, 166); // Light gray color
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 22, null, null, "center");
    
        // Add selected data to PDF
        doc.setFontSize(12);
        doc.setTextColor(44, 62, 80); // Back to dark blue
    
        let yOffset = 30;
        
        console.log("checkedItems: ",  checkedItems)

        console.log("gridData ",gridData)
        for (const userId in gridData) {
            console.log("uuserId ",userId)
            return
            if (checkedItems[userId]) {
                const userData = gridData[userId];
                const user = searchResults.find(r => r.id.toString() === userId);
    
                if (!user) {
                    console.error(`User with id ${userId} not found in searchResults`);
                    continue;
                }
    
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text(`${user.firstName} ${user.lastName}`, 10, yOffset);
                yOffset += 10;
    
                doc.setFontSize(12);
                doc.setFont("helvetica", "normal");
    
                // Add BGAndCarbs data
                doc.text(`BGAndCarbs Data:`, 15, yOffset);
                yOffset += 10;
    
                if (userData.bgAndCarbs && userData.bgAndCarbs.readings && userData.bgAndCarbs.readings.length > 0) {
                    // Create chart data
                    const chartData = {
                        labels: userData.bgAndCarbs.readings.map(r => r.time),
                        datasets: [
                            {
                                label: 'Carbs',
                                data: userData.bgAndCarbs.readings.map(r => r.carbs),
                                borderColor: 'rgb(153, 102, 255)',
                                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                            },
                            {
                                label: 'BG Level',
                                data: userData.bgAndCarbs.readings.map(r => r.bg),
                                borderColor: 'rgb(255, 99, 132)',
                                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                            }
                        ]
                    };
    
                    // Create a temporary chart
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = 400;
                    tempCanvas.height = 200;
                    const tempChart = new ChartJS(tempCanvas, {
                        type: 'line',
                        data: chartData,
                        options: {
                            responsive: false,
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                        }
                    });
    
                    // Add the chart to the PDF
                    const imgData = tempCanvas.toDataURL('image/png');
                    doc.addImage(imgData, 'PNG', 10, yOffset, 190, 95);
                    yOffset += 100;
    
                    // Clean up
                    tempChart.destroy();
    
                    // Add table with readings data
                    doc.setFontSize(10);
                    doc.text("Readings Data:", 10, yOffset);
                    yOffset += 10;
    
                    const headers = ["Time", "Carbs", "BG", "Meal"];
                    const data = userData.bgAndCarbs.readings.map(r => [r.time, r.carbs, r.bg, r.meal]);
    
                    doc.autoTable({
                        head: [headers],
                        body: data,
                        startY: yOffset,
                    });
    
                    yOffset = doc.lastAutoTable.finalY + 10;
                } else {
                    doc.text('No BGAndCarbs data available', 20, yOffset);
                    yOffset += 10;
                }
    
                // Add other user data
                doc.text(`Email: ${user.email}`, 15, yOffset);
                yOffset += 10;
                doc.text(`User Type: ${user.__typename}`, 15, yOffset);
                yOffset += 10;
                if (user.careData) {
                    doc.text(`Last Known BG: ${user.careData.lastKnownBG}`, 15, yOffset);
                    yOffset += 10;
                    doc.text(`MDI: ${user.careData.mdi ? 'Yes' : 'No'}`, 15, yOffset);
                    yOffset += 10;
                }
                if (user.volunteerAssignments && user.volunteerAssignments.length > 0) {
                    doc.text('Volunteer Assignments:', 15, yOffset);
                    yOffset += 10;
                    user.volunteerAssignments.forEach(assignment => {
                        doc.text(`- ${assignment.email}`, 20, yOffset);
                        yOffset += 10;
                    });
                }
    
                yOffset += 20; // Space between users
            }
        }
    
        // Add footer
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.setTextColor(149, 165, 166); // Light gray color
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, null, null, "center");
        }
    
        // doc.save("user_data_report.pdf");
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
                                startIcon={<PictureAsPdfIcon />} 
                                onClick={exportToPDF}
                            >
                                Export to PDF
                            </Button>
                            <Box>
                                <Button 
                                    variant="outlined" 
                                    color="primary" 
                                    onClick={() => handleCheckAll(true)}
                                    sx={{ mr: 1 }}
                                >
                                    Check All
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    color="primary" 
                                    onClick={() => handleCheckAll(false)}
                                >
                                    Uncheck All
                                </Button>
                            </Box>
                            <IconButton onClick={handleClose} color="error">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        {searchResults && searchResults.length > 0 && searchResults.map((row) => {
                            const key = `${row.firstName} - ${row.lastName} ${row.email}`;
                            return (
                                <UserAccordion 
                                    key={row.id}
                                    data={row}
                                    isChecked={checkedItems[key] || false}
                                    onCheckboxChange={handleCheckboxChange}
                                    onCopy={handleCopy}
                                    handleDataChange={handleDataChange}
                                />
                            );
                        })}
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
                        <IconButton size="small" aria-label="close" color="inherit" onClick={handleSnackbarClose}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    }
                />
            </>
        )}
    </Box>
    );
});
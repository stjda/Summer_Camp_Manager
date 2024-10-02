export const handleApolloError = (error, context = 'operation', setSnackbarMessage, setSnackbarOpen) => {
    console.error(`Error in ${context}:`, error);
    
    // Detailed error logging
    console.log('Full error object:', error);
    console.log('Error name:', error.name);
    console.log('Error message:', error.message);
    
    if (error.graphQLErrors) {
      console.log('GraphQL Errors:', error.graphQLErrors);
      error.graphQLErrors.forEach((graphQLError, index) => {
        console.log(`GraphQL Error ${index + 1}:`, graphQLError);
        console.log(`Error message:`, graphQLError.message);
        console.log(`Error locations:`, graphQLError.locations);
        console.log(`Error path:`, graphQLError.path);
        console.log(`Error extensions:`, graphQLError.extensions);
      });
    }
    
    if (error.networkError) {
      console.log('Network Error:', error.networkError);
      console.log('Network Error message:', error.networkError.message);
      console.log('Network Error stack:', error.networkError.stack);
      if (error.networkError.result) {
        console.log('Network Error result:', error.networkError.result);
      }
    }
  
    let errorMessage = `Error in ${context}`;
    if (error.graphQLErrors) {
      errorMessage += ': ' + error.graphQLErrors.map(e => e.message).join(', ');
    } else if (error.networkError) {
      errorMessage += ': Network error';
    } else {
      errorMessage += ': ' + error.message;
    }
  
    if (setSnackbarMessage && setSnackbarOpen) {
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    }
  
    return errorMessage;
  };
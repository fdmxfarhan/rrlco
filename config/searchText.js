module.exports = (target, search) => {
    // Remove spaces and special characters from both strings
    const cleanString = (str) => str.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '').toLowerCase();
  
    const cleanedTarget = cleanString(target);
    const cleanedSearch = cleanString(search);
  
    // Check if cleaned search string exists in the cleaned target string
    return cleanedTarget.includes(cleanedSearch);
}
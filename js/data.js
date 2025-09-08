// sites

const webringData = {
    "sites": [
        {
            "name": "Anita Jiang",
            "year": "2028",
            "website": "https://anitajiang.me"
        }
        // add new sites above this comment
        // for clarity: year refers to your projected graduation year.
        // follow this format:
        // {
        //     "name": "Your Name",
        //     "year": "YYYY",
        //     "website": "https://yoursite.com"
        // },
    ]
};

// init site arrays
let allSites = [...webringData.sites];
let filteredSites = [...webringData.sites];
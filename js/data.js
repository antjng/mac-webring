// sites

const webringData = {
    "sites": [
        {
            "name": "Anita Jiang",
            "year": "2028",
            "website": "https://anitajiang.me"
        },
        // add new sites above this comment
        // for clarity: year refers to your projected graduation year.
        // follow this format:
        {
        "name": "Shadi El-Fares",
        "year": "2027",
        "website": "https://shadielfares.com",
        "socials": {
            "linkedin": "https://www.linkedin.com/in/shadielfares/",
            "x": "https://x.com/shadielfares"
        }
        }
    ]
};

// init site arrays
let allSites = [...webringData.sites];
let filteredSites = [...webringData.sites];

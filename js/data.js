// sites

const webringData = {
  sites: [
    {
      name: "Anita Jiang",
      year: "2028",
      website: "https://anitajiang.me",
      socials: {
        linkedin: "https://www.linkedin.com/in/antjng/",
        x: "https://x.com/antjng_",
      },
    },
    {
      name: "Shadi El-Fares",
      year: "2027",
      website: "https://shadielfares.com",
      socials: {
        linkedin: "https://www.linkedin.com/in/shadielfares/",
        x: "https://x.com/shadielfares",
      },
    },
    {
      name: "Ayman Fouad",
      year: "2026",
      website: "https://ayman.fyi",
      socials: {
        linkedin: "https://www.linkedin.com/in/aymanfsm/",
        x: "https://x.com/aymanfsm",
        github: "https://github.com/aymanfouad123",
      },
    },
    {
      name: "Subodh Thallada",
      year: "2028",
      website: "https://subodhthallada.com/",
      socials: {
        linkedin: "https://www.linkedin.com/in/subodh-thallada/",
        x: "https://x.com/SubodhThallada",
        github: "https://github.com/subodh-thallada",
      },
    },
    // add new sites above this comment
    // for clarity: year refers to your projected graduation year.
    // follow this format:
    // {
    //     name: "Your Name",
    //     year: "20XX",
    //     website: "https://yourwebsite.com",
    //     socials: {
    //         linkedin: "https://www.linkedin.com/in/yourprofile/",
    //         x: "https://x.com/yourhandle",
    //         github: "https://github.com/yourhandle"
    //     }
    // }
    // note: if you don't have a social, omit that key entirely.
    // if you have no socials at all, you can omit the "socials" field.
  ],
};

// init site arrays
let allSites = [...webringData.sites];
let filteredSites = [...webringData.sites];

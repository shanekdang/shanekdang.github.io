/* ---------- PORTFOLIO PROJECTS ----------
   Each project becomes a page in the folder on the Portfolio tab.
   Add, remove, or reorder entries here; the folder lays itself out for any number of pages.

   Fields:
     title     – shown on the page tab and the project page
     year      – short label, e.g. '2026'
     summary   – one sentence under the title
     tags      – short labels (tools, topics)
     image     – optional, e.g. 'media/project1.jpg' (leave '' for a placeholder)
     sections  – the body of the project page, as { heading, text } blocks
     links     – optional buttons, e.g. { label: 'GitHub', url: 'https://…', icon: 'bxl-github' }
                 (icon names come from https://boxicons.com, e.g. 'bx-link-external', 'bxl-github')
*/

window.PROJECTS = [
    {
        title: 'Project One',
        year: '2026',
        summary: 'One-sentence summary of what this project is.',
        tags: ['Tag one', 'Tag two', 'Tag three'],
        image: '',
        sections: [
            { heading: 'Overview', text: 'What the project is, who it was for, and why it mattered.' },
            { heading: 'Approach', text: 'How you tackled it: the data, tools, and methods you used.' },
            { heading: 'Outcome', text: 'What came out of it: results, impact, or what you learned.' },
        ],
        links: [
            { label: 'View on GitHub', url: 'https://github.com/shanekdang', icon: 'bxl-github' },
        ],
    },
    {
        title: 'Project Two',
        year: '2025',
        summary: 'One-sentence summary of what this project is.',
        tags: ['Tag one', 'Tag two'],
        image: '',
        sections: [
            { heading: 'Overview', text: 'What the project is, who it was for, and why it mattered.' },
            { heading: 'Approach', text: 'How you tackled it: the data, tools, and methods you used.' },
            { heading: 'Outcome', text: 'What came out of it: results, impact, or what you learned.' },
        ],
        links: [],
    },
    {
        title: 'Project Three',
        year: '2024',
        summary: 'One-sentence summary of what this project is.',
        tags: ['Tag one', 'Tag two'],
        image: '',
        sections: [
            { heading: 'Overview', text: 'What the project is, who it was for, and why it mattered.' },
            { heading: 'Approach', text: 'How you tackled it: the data, tools, and methods you used.' },
            { heading: 'Outcome', text: 'What came out of it: results, impact, or what you learned.' },
        ],
        links: [],
    },
];

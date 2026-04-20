const readline = require('readline/promises').createInterface({ input: process.stdin, output: process.stdout });
const api = 'http://147.50.253.67:3001/api';

const color = {
    green: '\x1b[32m', red: '\x1b[31m', cyan: '\x1b[36m', yellow: '\x1b[33m', reset: '\x1b[0m', bold: '\x1b[1m'
};

(async () => {
    console.log(`\n${color.cyan}${color.bold}=== PREMIUM CLEANUP UTILITY ===${color.reset}`);
    const token = await readline.question(`${color.yellow}Enter Bearer Token:${color.reset} `);

    const menu = {
        '1': { name: 'Sites', path: id => `/sites/${id}`, method: 'DELETE' },
        '2': { name: 'Workers', path: id => `/workers/${id}?hard=true`, method: 'DELETE' },
        '3': { name: 'Users', path: id => `/users/${id}`, method: 'DELETE' },
        '4': { name: 'Expenses', path: id => `/expenses/${id}/reject`, method: 'PUT' }
    };

    while (true) {
        console.log(`\n${color.bold}--- SELECT ACTION ---${color.reset}`);
        console.log(`${color.cyan}1:Sites | 2:Workers | 3:Users | 4:Reject | ${color.yellow}5:DELETE ALL${color.cyan} | 0:Exit${color.reset}`);

        const choice = await readline.question(`${color.bold}Choice:${color.reset} `);
        if (choice === '0') break;
        if (choice !== '5' && !menu[choice]) continue;

        const start = parseInt(await readline.question(`${color.bold}Start ID:${color.reset} `));
        const end = parseInt(await readline.question(`${color.bold}End ID:${color.reset} `));

        console.log(`\n${color.yellow}Starting cleanup task...${color.reset}`);

        for (let id = start; id <= end; id++) {
            const targets = choice === '5' ? Object.keys(menu) : [choice];

            for (const t of targets) {
                const { path, method, name } = menu[t];
                try {
                    const res = await fetch(api + path(id), {
                        method,
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: method === 'PUT' ? '{}' : undefined
                    });

                    const statusColor = res.ok ? color.green : color.red;
                    console.log(`[${color.cyan}${id}${color.reset}] ${name.padEnd(8)} | ${method.padEnd(6)} -> ${statusColor}${res.status} ${res.statusText}${color.reset}`);
                } catch (e) {
                    console.log(`[${color.red}ERROR${color.reset}] ID ${id} (${name}): ${e.message}`);
                }
            }
        }
        console.log(`\n${color.green}${color.bold}Task Completed.${color.reset}`);
    }
    readline.close();
    console.log(`${color.cyan}Goodbye!${color.reset}`);
})();



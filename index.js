// Required modules
const express = require('express');
const fs = require('fs');

// Initialize Express app
const app = express();
const port = 3000;

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set JSON response formatting
app.set('json spaces', 4);

// Route to handle root endpoint
app.get('/', (req, res) => {
 // res.send('Asslamualaykum 🥰❤️‍🩹');
//});
  res.sendFile(__dirname + '/main/index.html');
});

// Retrieve member data from database/members.json if available, otherwise initialize an empty array
let membersInfo = JSON.parse(fs.readFileSync('database/members.json', 'utf8')) || [];

// Retrieve member balance data from database/balance.json if available, otherwise initialize an empty array
let members = JSON.parse(fs.readFileSync('database/balance.json', 'utf8')) || [];

// Function to save members' information to database/members.json
function saveMembersInfo() {
    const data = membersInfo.map(member => ({
        serialNumber: member.serialNumber,
        name: member.name,
        mobileNumber: member.mobileNumber,
        nidNumber: member.nidNumber
    }));

    fs.writeFile('database/members.json', JSON.stringify(data, null, 2), 'utf-8', (err) => {
        if (err) {
            console.error('Error saving members info:', err);
        } else {
            console.log('Members info saved successfully.');
        }
    });
}

// Function to save member balance data to database/balance.json
function saveMembers() {
    const data = members.map(member => ({
        serialNumber: member.serialNumber,
        name: member.name,
        balance: member.balance
    }));

    fs.writeFile('database/balance.json', JSON.stringify(data, null, 2), 'utf-8', (err) => {
        if (err) {
            console.error('Error saving member balance:', err);
        } else {
            console.log('Member balance saved successfully.');
        }
    });
}


// Routes for managing members

// Route to add a new member via query parameters
app.get('/members/add', (req, res) => {
    const { name, mobileNumber, nidNumber } = req.query;

    if (!name || !mobileNumber || !nidNumber) {
        return res.status(400).send('Please enter all required information.');
    }

    if (membersInfo.some(member => member.name === name)) {
        return res.status(400).send('Member already exists.');
    }

    const serialNumber = membersInfo.length + 1;

    membersInfo.push({ serialNumber, name, mobileNumber, nidNumber });
    saveMembersInfo();

    members.push({ serialNumber, name, balance: 0 });
    saveMembers();

    // Respond with the full member information
    res.send({
        message: 'Member added successfully.',
        member: { serialNumber, name, mobileNumber, nidNumber }
    });
});

// Route to search for a member by name or serial number
app.get('/members/search', (req, res) => {
    // Optionally, you can provide a search input to filter members
    const searchInput = req.query.searchInput ? req.query.searchInput.trim() : null;

    // If searchInput is provided, filter membersInfo array
    const filteredMembers = searchInput ?
        membersInfo.filter(member => member.name.includes(searchInput)) :
        membersInfo;

    // Respond with the filtered members' information
    res.send({
        message: 'Members found:',
        members: filteredMembers
    });
});

// Route to retrieve a specific member's information by serial number
app.get('/members/:serialNumber', (req, res) => {
    const serialNumber = parseInt(req.params.serialNumber);

    const member = membersInfo.find(m => m.serialNumber === serialNumber);

    if (member) {
        res.send({
            message: 'Member found:',
            member
        });
    } else {
        res.status(404).send('Member not found.');
    }
});

// Route to collect money from a member by serial number and amount
app.get('/collectmoney', (req, res) => {
    const { serialNumber, amount } = req.query;

    // Check if serialNumber and amount are provided
    if (!serialNumber || !amount) {
        return res.status(400).send('Please provide both serial number and amount.');
    }

    // Convert serialNumber to integer
    const memberSerialNumber = parseInt(serialNumber);

    // Find the member by serial number
    const memberIndex = members.findIndex(member => member.serialNumber === memberSerialNumber);

    if (memberIndex === -1) {
        return res.status(404).send('Member not found.');
    }

    // Update member's balance
    members[memberIndex].balance += parseFloat(amount);

    // Save the updated member data to database/balance.json
    saveMembers();

    // Respond with the updated member information
    res.json({
        message: 'Money collected successfully.',
        member: members[memberIndex]
    });
});

// Route to retrieve all member information from database/members.json
app.get('/member/all', (req, res) => {
    // Read the database/members.json file
    fs.readFile('database/members.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading members info:', err);
            return res.status(500).send('Internal Server Error');
        }

        // Parse the JSON data
        const membersInfoData = JSON.parse(data);

        // Respond with the member information
        res.send({
            message: 'All Members Information:',
            members: membersInfoData
        });
    });
});

// Route to retrieve a member's balance by serial number
app.get('/members/balance/:serialNumber', (req, res) => {
    const serialNumber = parseInt(req.params.serialNumber);

    // Find the member by serial number
    const member = members.find(m => m.serialNumber === serialNumber);

    if (member) {
        res.send({
            message: 'Member balance found:',
            member: { name: member.name, balance: member.balance }
        });
    } else {
        res.status(404).send('Member not found.');
    }
});

// Route to add a new member via query parameters
app.get('/member/new', (req, res) => {
    const { name, mobileNumber, nidNumber, privateKey } = req.query;

    if (!name || !mobileNumber || !nidNumber || !privateKey) {
        return res.status(400).send('Please enter all required information including private key.');
    }

    // Validate private key - You can implement your own validation logic here
    if (!isValidPrivateKey(privateKey)) {
        return res.status(401).send('Invalid private key.');
    }

    // Other validation logic can be added here if needed

    if (membersInfo.some(member => member.name === name)) {
        return res.status(400).send('Member already exists.');
    }

    const serialNumber = membersInfo.length + 1;

    membersInfo.push({ serialNumber, name, mobileNumber, nidNumber });
    saveMembersInfo();

    members.push({ serialNumber, name, balance: 0 });
    saveMembers();

    // Respond with the full member information
    res.send({
        message: 'Member added successfully.',
        member: { serialNumber, name, mobileNumber, nidNumber }
    });
});

// Function to validate private key (example)
function isValidPrivateKey(privateKey) {
    // Example validation logic - replace this with your actual validation logic
    return privateKey === 'XN34';
}

// Route to remove a member's data
app.get('/member/remove', (req, res) => {
    const { name, serialNumber } = req.query;

    if (!name || !serialNumber) {
        return res.status(400).send('Please provide both name and serial number of the member to remove.');
    }

    // Find the index of the member in membersInfo array
    const memberIndex = membersInfo.findIndex(member => member.name === name && member.serialNumber === parseInt(serialNumber));

    if (memberIndex === -1) {
        return res.status(404).send('Member not found.');
    }

    // Remove member from membersInfo array
    const removedMember = membersInfo.splice(memberIndex, 1)[0];
    saveMembersInfo();

    // Remove member from members array
    const removedMemberData = members.splice(memberIndex, 1)[0];
    saveMembers();

    // Write a message to indicate the member is removed by server admin
    const removeMessage = `Member ${removedMember.name} with serial number ${removedMember.serialNumber} is removed by server admin.`;
    fs.appendFileSync('removed_members.txt', removeMessage + '\n');

    res.send('Member removed successfully.');
});

// Route to update a member's name by serial number
app.get('/members/update/name/:serialNumber', (req, res) => {
    const serialNumber = parseInt(req.params.serialNumber);
    const { newName } = req.query;

    // Check if newName is provided
    if (!newName) {
        return res.status(400).send('Please provide the new name.');
    }

    // Check if the new name already exists
    const existingMember = membersInfo.find(member => member.name === newName);
    if (existingMember) {
        return res.status(400).send(`A member with the name '${newName}' already exists.`);
    }

    // Find the member by serial number in membersInfo array
    const memberIndex = membersInfo.findIndex(member => member.serialNumber === serialNumber);

    if (memberIndex === -1) {
        return res.status(404).send('Member not found.');
    }

    // Find the member by serial number in members array
    const memberBalanceIndex = members.findIndex(member => member.serialNumber === serialNumber);

    if (memberBalanceIndex === -1) {
        return res.status(404).send('Member balance not found.');
    }

    // Update member's name in membersInfo array
    membersInfo[memberIndex].name = newName;

    // Update member's name in members array
    members[memberBalanceIndex].name = newName;

    // Save the updated member data to database/members.json
    saveMembersInfo();

    // Save the updated member data to database/balance.json
    saveMembers();

    // Respond with the updated member information
    res.send({
        message: 'Member name updated successfully.',
        member: membersInfo[memberIndex]
    });
});
// Route to retrieve total balance of all members
app.get('/member/totalbalance', (req, res) => {
    // Read the balance JSON file
    fs.readFile('database/balance.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading balance file:', err);
            return res.status(500).send('Internal Server Error');
        }

        try {
            // Parse the JSON data
            const membersData = JSON.parse(data);

            // Calculate the total balance
            let totalBalance = 0;
            membersData.forEach(member => {
                totalBalance += member.balance;
            });

            // Send the total balance as response
            res.send({
                totalBalance: totalBalance
            });
        } catch (error) {
            console.error('Error parsing balance data:', error);
            res.status(500).send('Internal Server Error');
        }
    });
});




// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

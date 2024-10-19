const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const twilio = require('twilio');

// Twilio credentials
const accountSid = 'AC21ad2f9c6ebd29ef933060271ebe1c83';  // Replace with your SID
const authToken = 'c746df08f0cfe0729ef6d3734e34448f';    // Replace with your Auth Token
const client = new twilio(accountSid, authToken);

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'CSS')));
app.use(express.json()); // Middleware to parse JSON bodies

// Route to serve the admin panel
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Route to get prices (replaces get_prices.php)
app.get('/get_prices', (req, res) => {
    const pricesFile = path.join(__dirname, 'public', 'prices.json');
    fs.readFile(pricesFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading prices.json:', err);
            res.status(500).json({ error: 'Failed to load prices' });
        } else {
            res.json(JSON.parse(data));
        }
    });
});

// Route to update prices (replaces update_prices.php)
app.post('/update_prices', (req, res) => {
    const pricesFile = path.join(__dirname, 'public', 'prices.json');
    const updatedPrices = req.body.plans;

    // Read the existing prices.json file
    fs.readFile(pricesFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading prices.json:', err);
            return res.status(500).json({ error: 'Failed to read prices.json' });
        }

        try {
            // Parse the existing prices data
            const currentPrices = JSON.parse(data);

            // Merge the updated prices with the existing data
            const mergedPrices = currentPrices.plans.map((existingPlan, index) => ({
                ...existingPlan, // Keep the existing fields (like billing_cycle and features)
                original_price: updatedPrices[index].original_price, // Update the price fields
                discounted_price: updatedPrices[index].discounted_price
            }));

            // Write the updated prices back to prices.json
            fs.writeFile(pricesFile, JSON.stringify({ plans: mergedPrices }, null, 2), (err) => {
                if (err) {
                    console.error('Error writing to prices.json:', err);
                    return res.status(500).json({ error: 'Failed to update prices' });
                }

                // Return success response
                res.json({ message: 'Prices updated successfully' });
            });
        } catch (err) {
            console.error('Error parsing prices.json:', err);
            res.status(500).json({ error: 'Failed to parse prices.json' });
        }
    });
});


// Function to send WhatsApp notification via Twilio when prices are updated
function sendPriceUpdateNotification(newPrices) {
    const message = `Pricing plans have been updated:\n\nNormal Plan: ${newPrices.plans[0].discounted_price} INR\nProfessional Plan: ${newPrices.plans[1].discounted_price} INR\nAdvanced Plan: ${newPrices.plans[2].discounted_price} INR`;

    client.messages.create({
        body: message,
        from: 'whatsapp:+14155238886',  // Twilio Sandbox number
        to: 'whatsapp:+919405843777'    // Owner's WhatsApp number
    })
    .then((msg) => {
        console.log('WhatsApp message sent: ', msg.sid);
    })
    .catch((err) => {
        console.error('Error sending WhatsApp message:', err);
    });
}

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

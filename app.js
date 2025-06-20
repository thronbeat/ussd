require('dotenv').config();
const express = require('express');
const app = express();

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Optional: basic GET endpoint
app.get('/ussd', (req, res) => {
    res.send(`CON Welcome to Health BMI App`);
});

app.post('/ussd', (req, res) => {
    const { sessionId, phoneNumber, text } = req.body;

    let response = '';
    const inputs = text.split('*');

    console.log(`Session: ${sessionId}, Phone: ${phoneNumber}, Text: ${text}, Inputs:`, inputs);

    const lang = inputs[0]; // 1 = English, 2 = Kinyarwanda

    if (text === '') {
        // Step 1: Choose language
        response = `CON Welcome to Health BMI App
1. English
2. Kinyarwanda`;
    } else if (inputs.length === 1) {
        // Step 2: Ask for weight
        response = lang === '1'
            ? `CON Enter your weight in KG:`
            : `CON Injiza ibiro byawe mu KG:`;
    } else if (inputs.length === 2) {
        // Step 3: Ask for height
        response = lang === '1'
            ? `CON Enter your height in CM:`
            : `CON Injiza uburebure bwawe mu CM:`;
    } else if (inputs.length === 3) {
        // Step 4: Calculate BMI
        const weight = parseFloat(inputs[1]);
        const height = parseFloat(inputs[2]);

        if (isNaN(weight) || isNaN(height)) {
            response = lang === '1'
                ? 'END Invalid weight or height. Please enter valid numbers.'
                : 'END Ibiro cyangwa uburebure si imibare yemewe. Ongera ugerageze.';
        } else {
            const bmi = weight / ((height / 100) ** 2);

            let status = '';
            if (bmi < 18.5) status = lang === '1' ? 'Underweight' : 'Ufite ibiro biri hasi';
            else if (bmi < 25) status = lang === '1' ? 'Normal' : 'Bisanzwe';
            else if (bmi < 30) status = lang === '1' ? 'Overweight' : 'Ufite ibiro byinshi';
            else status = lang === '1' ? 'Obese' : 'Ufite ibiro bikabije';

            response = lang === '1'
                ? `CON Your BMI is ${bmi.toFixed(1)} (${status})
Would you like health tips?
1. Yes
2. No`
                : `CON BMI yawe ni ${bmi.toFixed(1)} (${status})
Waba ushaka inama z'ubuzima?
1. Yego
2. Oya`;
        }
    } else if (inputs.length === 4) {
        // Step 5: Provide health tips
        const weight = parseFloat(inputs[1]);
        const height = parseFloat(inputs[2]);
        const wantTips = inputs[3];
        const bmi = weight / ((height / 100) ** 2);

        let tip = '';
        if (bmi < 18.5) {
            tip = lang === '1'
                ? 'Eat more calories and protein. Consult a doctor.'
                : 'Fata ibiryo byinshi birimo poroteyine. Ganira na muganga.';
        } else if (bmi < 25) {
            tip = lang === '1'
                ? 'You are healthy. Maintain balanced meals.'
                : 'Uri muzima. Kurikiza indyo yuzuye.';
        } else if (bmi < 30) {
            tip = lang === '1'
                ? 'Exercise regularly and avoid junk food.'
                : 'Jya ukora imyitozo kandi wirinde ibiryo bibi.';
        } else {
            tip = lang === '1'
                ? 'See a doctor and follow a strict diet.'
                : 'Ganira na muganga kandi ukurikize indyo ikomeye.';
        }

        if (wantTips === '1') {
            response = `END ${tip}`;
        } else if (wantTips === '2') {
            response = lang === '1'
                ? 'END Thank you for using our service.'
                : 'END Murakoze gukoresha serivisi yacu.';
        } else {
            response = lang === '1'
                ? 'END Invalid option.'
                : 'END Igisubizo si cyo.';
        }
    } else {
        response = lang === '1'
            ? 'END Invalid input. Please restart.'
            : 'END Ikosa ryabaye. Ongera utangire.';
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`USSD app running at http://localhost:${PORT}/ussd`);
});

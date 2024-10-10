const express = require('express');
const natural = require('natural');
const path = require('path');

const app = express();

// Serve static files (CSS, JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Use middleware to handle form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Tokenizer function using 'natural'
const tokenizer = new natural.WordTokenizer();

// Store previous inputs (for demo purposes, stored in memory)
let previousSentences = [];

// Home route to take user input
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tokenize, Plot and Predict</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #ff5f6d, #ffc371);
            font-family: 'Inter', sans-serif;
        }

        .container {
            background: rgba(255, 255, 255, 0.9);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
            border-radius: 12px;
            padding: 2rem;
        }

        .title {
            font-size: 2.5rem;
            font-weight: 800;
            background: linear-gradient(#ff5f6d, #ffc371);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: bounce 2s infinite;
        }

        .description {
            color: #555;
            margin-bottom: 1.5rem;
            font-size: 1.1rem;
        }

        input, button {
            padding: 0.75rem;
            font-size: 1rem;
            border-radius: 8px;
            border: 2px solid #ff5f6d;
        }

        button {
            background-color: #ff5f6d;
            color: white;
            cursor: pointer;
            transition: background 0.3s ease, transform 0.2s;
        }

        button:hover {
            background-color: #ffc371;
            transform: scale(1.05);
        }

        a {
            color: #ff5f6d;
            font-weight: bold;
            text-decoration: underline;
            transition: color 0.3s ease;
        }

        a:hover {
            color: #ffc371;
        }

        @keyframes bounce {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-10px);
            }
        }
    </style>
</head>
<body class="min-h-screen flex flex-col items-center justify-center space-y-6">
    
    <!-- Main Tokenize Form -->
    <div class="container w-full max-w-md">
        <h1 class="title text-center mb-6">Tokenize, Plot & Predict</h1>
        <p class="description text-center">Enter a sentence below to see its tokens, visualize the results, and predict the next token length.</p>
        <form action="/tokenize" method="post" class="space-y-4">
            <label class="block text-gray-700 font-semibold">Enter a sentence:</label>
            <input type="text" name="sentence" class="w-full px-4 py-2 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="Type your sentence here" required />
            <button type="submit" class="w-full bg-pink-500 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
                Tokenize, Plot & Predict
            </button>
            <a href="/" class="text-pink-500 text-center block mt-2">Reset</a>
        </form>
    </div>

    <!-- Previous Inputs Section -->
    <div class="container w-full max-w-md mt-6">
        <h2 class="text-xl font-semibold mb-4 text-center">Previous Inputs</h2>
        <ul class="list-disc list-inside text-gray-700">
            ${previousSentences.length > 0 
                ? previousSentences.map(sentence => `<li>${sentence}</li>`).join('') 
                : '<p class="text-gray-500 text-center">No previous inputs yet.</p>'}
        </ul>
    </div>

</body>
</html>

    `);
});

// Route to handle tokenization and plotting
app.post('/tokenize', (req, res) => {
    const sentence = req.body.sentence;
    const tokens = tokenizer.tokenize(sentence);

    // Store the sentence in the previous input list
    previousSentences.push(sentence);
    if (previousSentences.length > 5) previousSentences.shift();  // Keep only the last 5 inputs

    // Create data for 3D plot
    const x = [];
    const y = [];
    const z = [];

    // Generate random data for each token and prepare arrays for plotting
    tokens.forEach((token, index) => {
        x.push(index); // Token index as 'x'
        y.push(token.length);  // Token length as 'y'
        z.push(Math.random() * 10);  // Random 'z' value
    });

    // Calculate the prediction: Average token length as a simple "prediction"
    const avgTokenLength = tokens.reduce((acc, token) => acc + token.length, 0) / tokens.length;
    const predictedTokenLength = avgTokenLength.toFixed(2); // Limit prediction to 2 decimal places

    // Serve the HTML with embedded plot and styling
    res.send(`
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tokenize, Plot and Predict</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <script src="https://cdn.plot.ly/plotly-2.35.2.min.js" charset="utf-8"></script>
    <style>
        body {
            background: linear-gradient(135deg, #ff5f6d, #ffc371);
            font-family: 'Inter', sans-serif;
        }

        .container {
            background: rgba(255, 255, 255, 0.9);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            border-radius: 16px;
            padding: 2rem;
        }

        .title {
            font-size: 2.5rem;
            font-weight: 800;
            background: -webkit-linear-gradient(#ff5f6d, #ffc371);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: pulse 2s infinite;
        }

        #plot {
            border: 3px solid #ff5f6d;
            border-radius: 10px;
        }

        a {
            display: inline-block;
            background: linear-gradient(135deg, #ff5f6d, #ffc371);
            color: white;
            font-weight: bold;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            text-decoration: none;
            transition: background 0.3s ease, transform 0.2s;
        }

        a:hover {
            background: linear-gradient(135deg, #ffc371, #ff5f6d);
            transform: scale(1.05);
        }

        .fade-in {
            animation: fadeIn 0.8s ease-in-out;
        }

        @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }

        @keyframes pulse {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.5;
            }
        }
    </style>
</head>
<body class="min-h-screen flex flex-col items-center justify-center space-y-4">
    <div class="container w-full max-w-3xl">
        <h1 class="title text-center mb-6">3D Token Plot</h1>

        <!-- Plot Area -->
        <div id="plot" class="h-96"></div>

        <!-- Clear Plot Button -->
        <button id="clearPlotBtn" class="mt-4">Clear Plot</button>
    </div>

    <a href="/" class="mt-4">Try another plot</a>

    <script>
        let tokens = ["Token1", "Token2", "Token3", "Token4"];  // Sample tokens
        let x = tokens.map((_, index) => index);
        let y = tokens.map(token => token.length);
        let z = tokens.map(() => Math.random() * 10);

        // Function to plot the tokens in 3D
        function plotTokens() {
            const trace = {
                x: x,
                y: y,
                z: z,
                mode: 'markers+text',
                marker: {
                    size: 12,
                    color: '#ff5f6d',
                    line: {
                        color: '#ffc371',
                        width: 2
                    },
                    opacity: 0.9
                },
                text: tokens,
                textposition: 'top center',
                type: 'scatter3d'
            };

            const layout = {
                title: '3D Token Plot with Labels',
                autosize: true,
                scene: {
                    xaxis: { title: 'Token Index', color: '#333' },
                    yaxis: { title: 'Token Length', color: '#333' },
                    zaxis: { title: 'Random Z', color: '#333' }
                }
            };

            const data = [trace];
            Plotly.newPlot('plot', data, layout);
        }

        // Clear Plot Functionality
        document.getElementById('clearPlotBtn').addEventListener('click', function() {
            Plotly.purge('plot');
        });

        // Plot tokens on page load
        plotTokens();
    </script>
</body>
</html>
    `);
});

// Start the server
const port = 3001;
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});

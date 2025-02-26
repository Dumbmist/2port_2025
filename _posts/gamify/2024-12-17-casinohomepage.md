---
layout: post
title: Casino Games
permalink: /gamify/casinohomepage
---
<style>
    body {
        text-align: center;
        font-family: 'Arial', sans-serif;
        background: url('./images/gamify/casino.jpg') no-repeat center center fixed;
        background-size: cover;
        color: white;
        margin: 0;
        padding: 0;
        overflow-x: hidden;
    }
    .container {
        max-width: 800px;
        margin: 50px auto;
        padding: 20px;
        background-color: rgba(0, 0, 0, 0.85);
        border-radius: 15px;
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.7);
        border: 2px solid #28a745;
        position: relative;
        overflow: hidden;
    }
    .game-boxes {
        display: grid;
        grid-template-columns: 1fr;
        gap: 20px;
    }
    @media (min-width: 600px) {
        .game-boxes {
            grid-template-columns: 1fr 1fr;
        }
    }
    .game-box {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-decoration: none;
        padding: 20px;
        background: linear-gradient(145deg, #000000, #333333);
        color: white;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
        border: 2px solid #28a745;
        transition: transform 0.3s, background-color 0.4s, box-shadow 0.3s;
        position: relative;
        overflow: hidden;
        cursor: pointer;
    }
    .game-box:hover {
        background: linear-gradient(145deg, #28a745, #c0392b);
        transform: scale(1.1);
        box-shadow: 0 10px 20px rgba(40, 167, 69, 0.6);
    }
    .game-box h2 {
        font-size: 2em;
        margin-bottom: 10px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }
    .game-box p {
        font-size: 1.2em;
    }
</style>

<div class="container">
    <div class="game-boxes">
        <div class="game-box" onclick="location='./blackjack'">
            <h2>Blackjack</h2>
            <p>Try your hand at beating the dealer!</p>
        </div>
        <div class="game-box" onclick="location='./dices'">
            <h2>Dices</h2>
            <p>Test your luck with the roll of a dice.</p>
        </div>
        <div class="game-box" onclick="location='./mines'">
            <h2>Mines</h2>
            <p>Navigate the board without triggering the mines.</p>
        </div>
        <div class="game-box" onclick="location='./poker'">
            <h2>Poker</h2>
            <p>Challenge your skills in this classic card game.</p>
        </div>
    </div>
</div>
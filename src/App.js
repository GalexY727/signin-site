import logo from './logo.svg';
import React from 'react';
import './App.css';

function App() {

  return (
    <div>
      <div class="login">
        <h1>Sign in</h1>
          <form method="post">
            <input type="text" name="u" placeholder="Enter your name" required="required" />
          </form>
      </div>
      <div class="names">
        <table class="table">
          <tr>
            <td>Aleg</td>
            <td>Aleg</td>
            <td>Aleg</td>
            <td>Aleg</td>
          </tr>
          <tr>
            <td>Jacueblol</td>
            <td>Jacueblol</td>
            <td>Jacueblol</td>
            <td>Jacueblol</td>
          </tr>
        </table>
      </div>
    </div>
  );
}

export default App;

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { useState, useRef } from 'react';
import studentWhitelist from './studentWhitelist';
import parentWhitelist from './parentWhitelist';

function App() {
  
  const scriptUrl = "https://script.google.com/macros/s/AKfycbxgDAO5EbVXVcRjcWpX4Akv9IIWN5gYImOxBUg3naqJ-3_iXU7ra05Z01iXvlRpgJ8/exec"
  const sheetID = "https://sheets.googleapis.com/v4/spreadsheets/1ulwe7y6T8UmQq_ItNZGkrwVdd4wi47h5RS_Wlexn32o/values/CurrentlySignedIn!A2:A";
  
  const [studentNames, setStudentNames] = useState([]);
  const [parentNames, setParentNames] = useState([]);

  const onSubmit = (e) => {
    e.preventDefault();
    
    const ref = inputRef.current;
    let input = ref.value.trim().toLowerCase();
    let equalityName = 
      (input.split(' ').length > 1) 
        ? (input.split(' ')[0] + ' ' + input.split(' ')[1].charAt(0)).toLowerCase() 
        : input.toLowerCase();
    if ((!studentWhitelist[1].includes(equalityName) &&
          !parentWhitelist[1].includes(equalityName)) ||
        studentNames.includes(studentWhitelist[0][studentWhitelist[1].indexOf(equalityName)]) ||
        parentNames.includes(parentWhitelist[0][parentWhitelist[1].indexOf(equalityName)])) 
      {
      ref.animate(
        [ { transform: "translate(1px, 1px) rotate(0deg)", },
          { transform: "translate(-1px, -2px) rotate(-1deg)" },
          { transform: "translate(-3px, 0px) rotate(1deg)", background: "red"},
          { transform: "translate(3px, 2px) rotate(0deg)",  },
          { transform: "translate(1px, -1px) rotate(1deg)" },
          { transform: "translate(-1px, 2px) rotate(-1deg)" },
          { transform: "translate(-3px, 1px) rotate(0deg)" },
          { transform: "translate(3px, 1px) rotate(-1deg)" },
          { transform: "translate(-1px, -1px) rotate(1deg)" },
          { transform: "translate(1px, 2px) rotate(0deg)" },
          { transform: "translate(1px, -2px) rotate(-1deg)" },
          { transform: "translate(1px, 1px) rotate(0deg)", background: "rgba(0,0,0,0.3)" }
        ], { 
          duration: 820,
          easing: "cubic-bezier(.36,.07,.19,.97)",
          fill: "both"
        });
      return
    }
    // Check if parent
    let realName;
    if (parentWhitelist[1].includes(equalityName)) {
      realName = parentWhitelist[0][parentWhitelist[1].indexOf(equalityName)]
      setParentNames([...parentNames, realName])
    } else {
      realName = studentWhitelist[0][studentWhitelist[1].indexOf(equalityName)]
      setStudentNames([...studentNames, realName])
    }
    checkIn(realName);
    inputRef.current.value = ""
  }

  const capitalizeEachWord = (str) => {
    return str.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
  }

  const removeName = (e) => {
    e.preventDefault();
    let name = e.target.innerHTML;
    checkOut(capitalizeEachWord(name));
    
    if (studentNames.includes(name)) {
      setStudentNames(studentNames.filter((el) => el !== name));
    } else {
      setParentNames(parentNames.filter((el) => el !== name));
    }
  }

  const checkIn = async (name) => {
    const data = [
      ['name', name],
      ['timestamp', Date.now() - 28800000], // Convert to PST from UTC
      ['inOrOut', 'In']
    ]
    post(data);
  }

  const checkOut = async (name) => {
      const data = [
        ['name', name],
        ['timestamp', Date.now() - 28800000], // Convert to PST from UTC
        ['inOrOut', 'Out']
      ]
      post(data);
  }

  const post = (data) => {

    var formDataObject = new FormData()

    data.forEach(element => {
      formDataObject.append(element[0], element[1])
    });


    fetch(scriptUrl, {method: 'POST', body: formDataObject})
    .catch(err => console.log(err))
  }

  const inputRef = useRef()

  return (
    <div>
      <div class="login">
        <h1>Sign in</h1>
          <form onSubmit={onSubmit}>
            <input ref={inputRef} type="text" name="u" placeholder="Enter your name" className='form' required="required" />
          </form>
      </div>
      <div className='px-3 text-center text-light students'>Students
        <div className='names d-flex flex-wrap'>
          {
            studentNames.map(
              (name) => 
                <div className='px-3 text-nowrap text-light name' key={name} onClick={removeName}>
                  {name}
                </div>
              )
          }
        </div>
      </div>
      <div className='px-3 text-center text-light mentors'>Parents
        <div className='names d-flex flex-wrap'>
          {
            parentNames.map(
              (name) => 
                <div className='px-3 text-nowrap text-light name' key={name} onClick={removeName}>
                  {name}
                </div>
              )
          }
        </div>
      </div>
      
    </div>
  );
}

export default App;
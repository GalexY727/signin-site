import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { useState, useRef, useEffect } from 'react';
import AutoComplete from './AutoComplete';
import studentWhitelist from './studentWhitelist';

function App() {
  
  useEffect(() => {
      fetch(process.env.REACT_APP_GET_SHEET_DATA, {method: 'GET'})
              .then((response) => response.json())
              .then((json) => {
                if (json.valueRanges && json.valueRanges[0] && json.valueRanges[0].values) {
                  setStudentNames(json.valueRanges[0].values.map((name) => name[0]).filter((name)=> name !== undefined));
                }
                if (json.valueRanges && json.valueRanges[1] && json.valueRanges[1].values) {
                  setParentNames(json.valueRanges[1].values.map((name) => name[0]).filter((name) => name !== undefined));
                }
              });
  }, [])
  
  const [studentNames, setStudentNames] = useState([]);
  const [parentNames, setParentNames] = useState([]);

  const studentRef = useRef()
  const parentRef = useRef()

  let isShiftPressed = false;
  
  const studentSubmit = (inputRef) => {
    const ref = inputRef.current;
    // normalize the input by removing all non-alphanumeric characters, 
    // trim spaces, and lowercase
    const input = ref.value.trim().toLowerCase().replace(/[^a-zA-Z0-9 ]/g, "");
    const equalityName = 
      (input.split(' ').length > 1) 
        ? (input.split(' ')[0] + ' ' + input.split(' ')[1].charAt(0)).toLowerCase() 
        : input.toLowerCase();

    if (!studentWhitelist[1].includes(equalityName) ||
        studentNames.includes(studentWhitelist[0][studentWhitelist[1].indexOf(equalityName)])) 
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
    
    let realName = studentWhitelist[0][studentWhitelist[1].indexOf(equalityName)];
    setStudentNames([...studentNames, realName]);
    makeData(realName, 'In');
    inputRef.current.value = "";
  }

  const parentSubmit = (e) => {
    e.preventDefault();
    const ref = parentRef.current;
    const name = ref.value.trim().replace(/[^a-zA-Z0-9 ]/g, "");
    setParentNames([...parentNames, name]);
    makeData(name, 'In', false);
    parentRef.current.value = "";
  }

  const capitalizeEachWord = (str) => {
    // Capitalize each word
    return str.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
  }

  const removeName = (e) => {
    e.preventDefault();
    let name = e.target.innerHTML;
    
    if (studentNames.includes(name)) {
      setStudentNames(studentNames.filter((el) => el !== name));
      makeData(capitalizeEachWord(name), 'Out');
    } else {
      setParentNames(parentNames.filter((el) => el !== name));
      makeData(name, 'Out', false);
    }

  }

  const makeData = async (name, inOrOut, isStudent=true) => {
    const data = [
      ['name', name],
      ['timestamp', Date.now() - 28800000], // Convert to PST from UTC
      ['inOrOut', inOrOut],
      ['studentOrParent', isStudent ? 'Student' : 'Parent']
    ]
    postData(data, isStudent);
  }

  const postData = (data, isStudent) => {

    var formDataObject = new FormData()

    data.forEach(element => {
      formDataObject.append(element[0], element[1])
    });

    let url = process.env.REACT_APP_SHEET_POST_URL;
    url = "https://script.google.com/macros/s/AKfycbxCNw4ENEt3uJmJikWq7WQLeHv182INQgTsofIE7SxWsQFkFPm2jnG3rgzpHkvtvV3dow/exec"
    fetch(url, {method: 'POST', body: formDataObject})
    .catch(err => console.log(err))
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') {
      isShiftPressed = true;
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') {
      isShiftPressed = false;
    }
  });

  let hoverEffect = false;

  const startHover = (e) => {
    e.preventDefault();
    if (hoverEffect) {
        e.target.dataset.hoverInterval = setInterval(() => {
        if (isShiftPressed) {
          e.target.classList.add('text-red');
          e.target.classList.remove('text-transparent');
        } else {
          e.target.classList.add('text-transparent');
          e.target.classList.remove('text-red');
        }
      }, 50);
    } else {
      e.target.classList.add('text-transparent');
    }
  }

  const stopHover = (e) => {
    e.preventDefault();
    if (hoverEffect) {
      clearInterval(e.target.dataset.hoverInterval);
      e.target.classList.remove('text-red');
    }
    e.target.classList.remove('text-transparent');
  }

  return (
    <div>
      <div className="login student-side">
        <h1 className='user-select-none'>Student sign in</h1>
          <form onSubmit={studentSubmit}>
            <AutoComplete onSubmit={studentSubmit} ref={studentRef} options={studentWhitelist[0]} className='form'/>
          </form>
      </div>
      <div className="login parent-side">
        <h1 className='user-select-none'>Parent sign in</h1>
          <form onSubmit={parentSubmit}>
            <input ref={parentRef} type="text" name="v" placeholder="Enter your full name" className='form' required="required" />
          </form>
      </div>
      <div className='px-3 text-center text-light students user-select-none'>Students:
        <div className='names d-flex flex-wrap'>
          {
            studentNames.map(
              (name,index) => 
                <div className='px-3 text-nowrap text-light name' key={index}>
                  <span onMouseOver={startHover} onMouseOut={stopHover} onClick={removeName}>{name}</span>
                </div>
            )
          }
        </div>
      </div>
      <div className='px-3 text-center text-light mentors user-select-none'>Parents:
      <div className='names d-flex flex-wrap'>
          {
            parentNames.map(
              (name) => 
                <div className='px-3 text-nowrap text-light name' key={name}>
                  <span onMouseOver={startHover} onMouseOut={stopHover} onClick={removeName}>{name}</span>
                </div>
            )
          }
        </div>
      </div>
    </div>
  );
}

export default App;
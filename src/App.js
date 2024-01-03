import { React, useState, useRef, useEffect } from 'react';
import AutoComplete from './AutoComplete';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './Loader.css';

function App() {

  const [studentNames, setStudentNames] = useState([]);
  const [parentNames, setParentNames] = useState([]);
  const [studentWhitelist, setStudentWhitelist] = useState([]);
  const [parentWhitelist, setParentWhitelist] = useState([]);
  const [studentHashmap, setStudentHashmap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const groupNames = ['Build', 'Design', 'Programming', 'Marketing', 'Leadership']; 

  // Pull from the cache in sheets on startup
  useEffect(() => {
        setTimeout(() => {
          fetch(process.env.REACT_APP_GET_SHEET_DATA, {method: 'GET'})
                  .then((response) => response.json())
                  .then((json) => {
                    if (json.valueRanges && json.valueRanges[0] && json.valueRanges[0].values) {
                      setStudentNames(json.valueRanges[0].values.map((name) => name[0]).filter((name)=> name !== undefined && name !== ''));
                    }
                    if (json.valueRanges && json.valueRanges[1] && json.valueRanges[1].values) {
                      setParentNames(json.valueRanges[1].values.map((name) => name[0]).filter((name) => name !== undefined && name !== ''));
                    }
                    // Set the studentWhitelist based upon col 5
                    if (json.valueRanges && json.valueRanges[2] && json.valueRanges[2].values) {
                      setStudentWhitelist(
                        json.valueRanges[2].values
                          .map((name) => name[0])
                          .filter(
                            (name) =>
                              name !== undefined &&
                              name.replace(/[^a-zA-Z0-9 ]/g, "").trim() !== ""
                          )
                      );
                      setStudentHashmap(
                        json.valueRanges[2].values.reduce(
                          (acc, [name, group]) => {
                            acc[name] = group;
                            return acc;
                          },
                          {}
                        )
                      );
                      setParentWhitelist(
                        json.valueRanges[2].values
                          .map((row) => {
                            // Extract parent names from columns 3-8
                            let parentNames = row
                              .slice(2, 8)
                              .filter((name) => name !== undefined);
                            return parentNames;
                          })
                          .flat() // Flatten the array
                          .filter(
                            (name) =>
                              name.replace(/[^a-zA-Z0-9 ]/g, "").trim() !== ""
                          )
                      );
                    }
                    setIsLoading(false);
                  });
        }, 3000);
  }, [])


  const acceptedAnimation = (ref) => {
    ref.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.02)", background: "rgba(0,255,0,0.5)" },
        { transform: "scale(1)", background: "rgba(0,0,0,0.3)" },
      ],
      { duration: 800, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" }
    );
  };

  const removalAnimation = (ref) => {
    ref.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(0.93)", background: "rgba(170,19,24,0.6)" },
          { transform: "scale(1)", background: "rgba(0,0,0,0.3)" },
        ],
        { duration: 800, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" }
    );
  };

  const deniedAnimation = (ref) => {
    ref.animate(
      [
        { transform: "translate(1px, 1px) rotate(0deg)" },
        { transform: "translate(-1px, -2px) rotate(-1deg)" },
        { transform: "translate(-3px, 0px) rotate(1deg)", background: "red" },
        { transform: "translate(3px, 2px) rotate(0deg)" },
        { transform: "translate(1px, -1px) rotate(1deg)" },
        { transform: "translate(-1px, 2px) rotate(-1deg)" },
        { transform: "translate(-3px, 1px) rotate(0deg)" },
        { transform: "translate(3px, 1px) rotate(-1deg)" },
        { transform: "translate(-1px, -1px) rotate(1deg)" },
        { transform: "translate(1px, 2px) rotate(0deg)" },
        { transform: "translate(1px, -2px) rotate(-1deg)" },
        {
          transform: "translate(1px, 1px) rotate(0deg)",
          background: "rgba(0,0,0,0.3)",
        },
      ],
      {
        duration: 820,
        easing: "cubic-bezier(.36,.07,.19,.97)",
        fill: "both",
      }
    );
  };

  const nameRemovalAnimation = (ref) => {
    return ref.animate(
      [
        { transform: "scale(1)", color: "rgba(255,0,0,0.5)" },
        { transform: "scale(1.02)" },
        { transform: "scale(0.01)", color: "rgba(255,0,0,0.5)"},
      ],
      { duration: 500, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" }
    );
  };
  
  const studentSubmit = (inputRef) => {
    const ref = inputRef.current;
    // normalize the input by removing all non-alphanumeric characters, 
    // trim spaces, and lowercase
    const input = ref.value.trim().replace(/[^a-zA-Z0-9 ]/g, "");

    if (!studentWhitelist.includes(input)) {
      deniedAnimation(ref);
      return
    }

    if (studentNames.includes(input)) {
      removalAnimation(ref);
      makeData(input, 'Out');
      setStudentNames((currentNames) => currentNames.filter((el) => el !== input));
      inputRef.current.value = "";
      return;
    }

    acceptedAnimation(ref);
    let newStudentNames = [...studentNames, input];
    setStudentNames(newStudentNames);
    makeData(input, 'In');
    inputRef.current.value = "";
  }

  const parentSubmit = (inputRef) => {
    const ref = inputRef.current;
    // normalize the input by removing all non-alphanumeric characters, 
    // trim spaces, and lowercase
    const input = ref.value.trim().replace(/[^a-zA-Z0-9 ]/g, "");
    
    if (parentNames.includes(input) || !parentWhitelist.includes(input)) {
      deniedAnimation(ref);
      return
    }

    acceptedAnimation(ref);
    let newParentNames = [...parentNames, input];
    setParentNames(newParentNames);
    makeData(input, 'In', false);
    inputRef.current.value = "";
  }

  const removeName = (e) => {
    e.preventDefault();
    e.target.parentNode.style.pointerEvents = 'none';
    let name = e.target.textContent;
    if (studentNames.includes(name)) {
      makeData(name, 'Out');
      nameRemovalAnimation(e.target.parentNode).onfinish = () => {
        setStudentNames((currentNames) => currentNames.filter((el) => el !== name));
      };
    } else if (parentNames.includes(name)) {
      makeData(name, 'Out', false);
      nameRemovalAnimation(e.target.parentNode).onfinish = () => {
        setParentNames((currentNames) => currentNames.filter((el) => el !== name));
      };
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
    fetch(url, {method: 'POST', body: formDataObject})
      .catch(err => console.log(err))
  }

  return (
    <div>
      <div className="login student-side">
        <h1 className="user-select-none">Student sign in</h1>
        <form onSubmit={studentSubmit}>
          <AutoComplete
            onSubmit={studentSubmit}
            whitelist={studentWhitelist}
            className="form"
          />
        </form>
      </div>
      <div className="login parent-side">
        <h1 className="user-select-none">Parent/Mentor sign in</h1>
        <form onSubmit={parentSubmit}>
          <AutoComplete
            onSubmit={parentSubmit}
            whitelist={parentWhitelist}
            className="form"
          />
        </form>
      </div>
      <div className="px-3 text-center text-light students user-select-none">
        <h3>{isLoading || studentNames.length === 0 ? " " : "Students:"}</h3>
        <div className="names d-flex flex-wrap">
          {
            /* Loop over each group (Build, Design, etc) */
            groupNames.map(groupName => {
              const namesInGroup = Object.entries(studentHashmap)
              .filter(([name, group]) => group === groupName && studentNames.includes(name));
              return namesInGroup.length > 0 && (
                <div className="group-name" key={groupName}>
                  <h4>{groupName}</h4>
                  <div className="group">
                    {namesInGroup.map(([name]) => (
                      <div className="px-3 text-nowrap text-light name" key={name}>
                        <span>
                        {(name === 'Emily Hager') ? '🦒 ':''}
                          <span onClick={removeName}>{name}</span>
                        {(name === 'Emily Hager') ? ' 🦒':''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
        <span className='loader'></span>
      </div>
      <div className='px-3 text-center text-light mentors user-select-none'>
        <h3>{isLoading || parentNames.length === 0 ? " " : "Parents/Mentors:"}</h3>
        <div className="names group row">
          {parentNames.map((name) => (
            <div className="px-3 text-nowrap text-light name col-md-6" key={name}>
              <span>
                <span onClick={removeName}>{name}</span>
              </span>
            </div>
          ))}
        </div>
        <span className='loader'></span>
      </div>
    </div>
  );
}

export default App;
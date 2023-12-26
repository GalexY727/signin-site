import { React, useState, useRef, useEffect } from 'react';
import AutoComplete from '../components/AutoComplete';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';
import '../Loader.css';

function Home() {

  const [studentNames, setStudentNames] = useState([]);
  const [parentNames, setParentNames] = useState([]);
  const [studentWhitelist, setStudentWhitelist] = useState([[], []]);
  const [isLoading, setIsLoading] = useState(true);

  const studentRef = useRef()
  const parentRef = useRef()
  
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
                      let whitelist = json.valueRanges[2].values.map((name) => name[0]).filter((name) => name !== undefined && name.replace(/[^a-zA-Z0-9 ]/g, "").trim() !== '');
                      setStudentWhitelist([
                        whitelist,
                        whitelist.map((name) => 
                          (name.replace(/[^a-zA-Z0-9 ]/g, "").trim().split(' ')[0] + ' ' + name.split(' ')[1].charAt(0)).toLowerCase()
                        )
                      ]);
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
    ref.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.02)" },
        { transform: "scale(0.01)" },
      ],
      { duration: 500, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }
    );
  };
  
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
      deniedAnimation(ref);
      return
    }

    acceptedAnimation(ref);
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
      // This is quite buggy, if you remove a name it will make another transparent...
      // Try experimenting with maybe making a new element that is separate from this area...
      // a closing transition would be neatm transition transformX?
      setTimeout(() => {
        setStudentNames(studentNames.filter((el) => el !== name));
      }, 550);
      nameRemovalAnimation(e.target);
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
            ref={studentRef}
            whitelist={studentWhitelist[0]}
            className="form"
          />
        </form>
      </div>
      <div className="login parent-side">
        <h1 className="user-select-none">Parent sign in</h1>
        <form onSubmit={parentSubmit}>
          <input
            ref={parentRef}
            type="text"
            name="v"
            placeholder="Enter your full name"
            className="form"
            required="required"
          />
        </form>
      </div>
      <div className="px-3 text-center text-light students user-select-none">
        {isLoading || studentNames.length === 0 ? " " : "Students:"}
        <div className="names d-flex flex-wrap">
          {studentNames.map((name, index) => (
            <div className="px-3 text-nowrap text-light name" key={index}>
              <span
                onClick={removeName}
              >
                {name}
              </span>
            </div>
          ))}
        </div>
        <span className='loader'></span>
      </div>
      <div className='px-3 text-center text-light mentors user-select-none'>
        {isLoading || parentNames.length === 0 ? " " : "Parents:"}
        <div className="names d-flex flex-wrap">
          {parentNames.map((name) => (
            <div className="px-3 text-nowrap text-light name" key={name}>
              <span
                onClick={removeName}
              >
                {name}
              </span>
            </div>
          ))}
        </div>
        <span className='loader'></span>
      </div>
    </div>
  );
}

export default Home;
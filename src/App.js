
import './App.css';
import { useSnackbar } from 'react-simple-snackbar'
import { useRef, useEffect, useState } from "react";



const App = () => {
const [openSnackbar] = useSnackbar()
 const autoCompleteSourceRef = useRef();
 const autoCompleteDestinationRef = useRef();
 const inputSourceRef = useRef();
 const inputDestinationRef = useRef();
 const [sourceInput, setSourceInput] = useState();
 const [destInput, setDestInput] = useState();
 const [output, setOutput] = useState([]);

 useEffect(() => {
  const options = {
    componentRestrictions: { country: "ng" },
    fields: ["address_components", "geometry", "icon", "name"],
    types: ["establishment"]
   };

  autoCompleteSourceRef.current = new window.google.maps.places.Autocomplete(
    inputSourceRef.current,
   options
  );
  autoCompleteDestinationRef.current = new window.google.maps.places.Autocomplete(
    inputDestinationRef.current,
   options
  );
  autoCompleteSourceRef.current.addListener("place_changed", async function () {
    const place = await autoCompleteSourceRef.current.getPlace();
    setSourceInput(place.name)
   });
   autoCompleteDestinationRef.current.addListener("place_changed", async function () {
    const place = await autoCompleteDestinationRef.current.getPlace();
    setDestInput(place.name)
   });
 }, []);

 const saveFormData = async () => {
  if(!sourceInput || !destInput){
    return openSnackbar('Invalid inputs')
  }

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    "source": sourceInput,
    "destination": destInput
  });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };
  let result;
  await fetch(`${process.env.REACT_APP_URL}`, requestOptions)
    .then(response => response.json())
    .then(res => result = res)
    .catch(error => console.log('error', error));

    if (result.status !== 200) {
      return openSnackbar('Failed') 
    }
    if(!result.data[0].source || !result.data[0].destination || !result.data[0].duration || !result.data[0].distance){
      return openSnackbar('Failed to fetch all info')
    }
    setOutput(result.data) 
}

 const onSubmit = async (event) => {
    event.preventDefault();
    try {
      await saveFormData();
    } catch (e) {
      return openSnackbar(`Search failed ${e.message}`);
    }
  }

 return (
  <div className="App">
  <div className='heading'>
    <h1>Plotline assignment</h1>
    <p>Anmol Bhardwaj</p>
    <a href="https://anmolbhardwaj.in/" rel="noreferrer" target="_blank">anmolbhardwaj.in</a>
  </div>
   <form onSubmit={onSubmit}>
    <div className="field">
    <label>Enter source</label>
    <input ref={inputSourceRef} value={sourceInput} onChange={(e) => setSourceInput(e.target.value)}/>
    </div>
    <div className="field">
    <label>Enter destination</label>
    <input ref={inputDestinationRef} value={destInput} onChange={(e) => setDestInput(e.target.value)}/>
    </div>
    <button className="btn" type="submit">Find distance</button>
   </form>
   {output.map(out => {
    return(
      <div className="output">
      <div className="inner">
        <p className="label">Source</p>
        <p className="value">{out.source}</p>
      </div>
      <div className="inner">
        <p className="label">Destination</p>
        <p className="value">{out.destination}</p>
      </div>
      <div className="flexing">
      <div className="inner">
        <p className="label">Distance</p>
        <p className="value">{out.distance}</p>
      </div>
      <div className="inner innerRight">
        <p className="label">Duration</p>
        <p className="value">{out.duration}</p>
      </div>
      </div>
      <div className="map">
      <p className="label">Map</p>
      <iframe
      title="plotline assignment map"
  width={(window.innerWidth) <= 455 ? (window.innerWidth)*0.9 : (window.innerWidth)*0.4}
  height="450"
  frameBorder="0" style={{ border: 0 }}
  referrerPolicy="no-referrer-when-downgrade"
  src={out.maplink}
  allowFullScreen>
</iframe>
      </div>
      </div>
    )
   })}
  </div>
 );
};
export default App;

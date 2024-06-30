import {useState,useEffect} from 'react';
import { Routes , Route } from 'react-router-dom';

import Home from './Pages/Home';

function App() {

  const [ pageStates,setPageStates ] = useState({
    isScreened:true,
  });

  useEffect(() => {
    function handleWindowResize() {
      const { innerWidth } = getWindowSize();
      if(innerWidth < 1200){
        setPageStates( (prev)=>({...prev,isScreened:false}) );
      }
      else{
        setPageStates( (prev)=>({...prev,isScreened:true}) );
      }
    }

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  if(pageStates.isScreened){
    return (
      <>
        <>
          <Routes>
            <Route path="/" element={<Home/>} />
          </Routes>
        </>
      </>
    );
  }
  else{
    return(
      <div className="flex justify-center w-full h-[100vh]">
          <div className="flex flex-col gap-2 justify-center items-center">
              <div className="bg-orange rounded-md p-10 w-fit">
                  <i className="fa-solid fa-mobile text-[40px] text-black"></i>
              </div>
              <p className="fontInter text-[20px] font-medium text-center px-10">We're still not available for mobile. Use desktop to see us.</p>
          </div>
      </div>
    )
  }

}

export default App;

function getWindowSize() {
  const {innerWidth, innerHeight} = window;
  return {innerWidth, innerHeight};
}
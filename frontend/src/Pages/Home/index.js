import {useState,useRef} from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { string } from 'joi';

export default function Home(){

    const [pageStates,setPageStates] = useState({
        loading:false,
        prompt:'',
        response:'',
        theme:'vs-dark',
        mainBg:'#28282B',
        mainText:'#FAF9F6',
        language:'python'
    });

    const [compilerResponse,setCompilerResponse] = useState({
        compiling:false,
        executionTime:'',
        memory:'',
        cpuTime:'',
        compilerMessage:'',
        output:''
    });

    const generateResponse = async (e) => {
        e.preventDefault();
        if(pageStates.prompt !== ''){
            try{
                const result = await axios.post('https://api.openai.com/v1/chat/completions',{
                    model: "gpt-3.5-turbo-1106",
                    messages:[
                        {role:'user',content:pageStates.prompt}
                    ]
                },
                {
                    headers:{
                        'Content-Type':'application/json',
                        Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
                    }
                });
                console.log(result.data);
                setPageStates((prev)=>({...prev,response:result.data.choices[0].message.content}));
            }
            catch(error){
                if(error.response.status === 429){
                    setPageStates((prev)=>({...prev,response:'API Key limit exceeded'}))
                }
                else{
                    setPageStates((prev)=>({...prev,response:'Something went wrong'}))
                }
            }
        }
    };

    const runCode = async(e) =>{
        e.preventDefault();
        setCompilerResponse((prev)=>({...prev,compiling:true}));
        try{
            const result = await axios.post('http://localhost:5000/api/execute/',{
                language:pageStates.language,
                script:editorRef.current.getValue()
            });
            if(result.data.compile_message === ""){
                setCompilerResponse((prev)=>({...prev,compilerMessage:'Compiled',executionTime:(result.data.execute_time!==null)?string(result.data.execute_time):'-',cpuTime:(result.data.cpu_time!==null)?string(result.data.cpu_time):'-',memory:(result.data.memory!==null)?string(result.data.memory):'-',output:result.data.output}));
            }
            else{
                setCompilerResponse((prev)=>({...prev,compilerMessage:'Error',executionTime:(result.data.execute_time!==null)?string(result.data.execute_time):'-',cpuTime:(result.data.cpu_time!==null)?string(result.data.cpu_time):'-',memory:(result.data.memory!==null)?string(result.data.memory):'-',output:result.data.compile_message}));
            }
            setCompilerResponse((prev)=>({...prev,compiling:false}));
        }
        catch(error){
            setCompilerResponse((prev)=>({...prev,compilerMessage:'Error',executionTime:'-',cpuTime:'-',memory:'-',output:'Unable to run your code'}));
            setCompilerResponse((prev)=>({...prev,compiling:false}));
        }
    }

    const switchTheme = (e) =>{
        e.preventDefault();
        if(pageStates.theme === 'vs-dark'){
            setPageStates((prev)=>({...prev,theme:'vs-light',mainBg:'#FAF9F6',mainText:'#000000'}));
        }
        else if(pageStates.theme === 'vs-light'){
            setPageStates((prev)=>({...prev,theme:'vs-dark',mainBg:'#28282B',mainText:'#FAF9F6'}));
        }
    }

    const switchLanguage = (event,language) =>{
        event.preventDefault()
        setPageStates((prev)=>({...prev,language:language}));
    }

    const editorRef = useRef(null);

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
    }

    return(
        <>
            <div className={`m-0 p-3`} style={{backgroundColor:pageStates.mainBg}}>
                <p className={`m-0 p-0 text-left text-5xl`} style={{color:pageStates.mainText}}>Code Judge</p>
            </div>
            <div className="grid grid-flow-row" style={{backgroundColor:pageStates.mainBg}}>
                <div className='grid grid-flow-col grid-cols-4'>
                    <div className='m-2 col-span-3'>
                        <Editor
                            height='70vh'
                            theme={pageStates.theme}
                            language={pageStates.language}
                            defaultValue='//Your code goes here'
                            onMount={handleEditorDidMount}
                        />
                    </div>
                    <div className='grid grid-flow-row grid-rows-3 gap-1 m-2 col-span-1'>
                        <div className='row-span-1' style={{backgroundColor:pageStates.mainBg}}>
                            <p className='text-2xl mb-3' style={{color:pageStates.mainText}}>Ask ChatGPT</p>
                            <form onSubmit={(e)=>{generateResponse(e)}}>
                                <div>
                                    <textarea className='w-[100%] p-1 rounded-sm border-none outline-none resize-none bg-white bg-opacity-5' style={{color:pageStates.mainText}} onChange={(e)=>{setPageStates((prev)=>({...prev,prompt:e.target.value}))}} rows={2} placeholder='Enter your search here...'></textarea>
                                </div>
                                <input type='submit' disabled={pageStates.loading} className='w-[100%] p-1 bg-[#28a08c] rounded-sm text-white' value={(pageStates.loading)?'Generating...':'Generate Response'}/>
                            </form>
                        </div>
                        <div className=' m-0 bg-white bg-opacity-0 border-[0.01rem] border-[#000] border-opacity-35 rounded-sm row-span-2'>
                            <p className='text-left p-2' style={{backgroundColor:pageStates.mainBg,color:pageStates.mainText}}>{pageStates.response}</p>
                        </div>
                    </div>
                </div>
                <div className='px-2 py-1 grid grid-flow-col grid-cols-4 gap-2'>
                    <div className='col-span-1 flex flex-col justify-center'>
                        <select onChange={(e)=>{switchLanguage(e,e.target.value)}} className='w-[100%] mb-2 p-1 rounded-sm outline-none border-[0.01rem]' style={{backgroundColor:pageStates.mainBg,color:pageStates.mainText,borderColor:pageStates.mainText}}>
                            <option value='python'>Python</option>
                            <option value='c'>C</option>
                            <option value='cpp'>CPP</option>
                            <option value='java'>Java</option>
                            <option value='nodejs'>NodeJS</option>
                            <option value='ruby'>Ruby</option>
                        </select>
                        <button onClick={runCode} disabled={compilerResponse.compiling} className='w-[100%] mb-2 bg-[#4B70F5] p-1 rounded-sm outline-none border-none text-white'><i className="fa-solid fa-play px-2"></i>Compile and Run</button>
                        <button type='buttom' onClick={switchTheme} className={`w-[100%] bg-[#4B70F5] p-1 rounded-sm outline-none border-none text-white`}><i className="fa-solid fa-right-left px-2"></i>Switch Theme</button>
                    </div>
                    <div className={`col-span-1 flex flex-col justify-center items-start`} style={{color:pageStates.mainText}}>
                        <p>Execution Time: {compilerResponse.executionTime}</p>
                        <p>Memory: {compilerResponse.memory}</p>
                        <p>CPU Time: {compilerResponse.cpuTime}</p>
                        <p>Compiler Message: {compilerResponse.compilerMessage}</p>
                    </div>
                    <div className='col-span-2'>
                        <div className='grid grid-flow-row grid-rows-5'>
                            <p className='row-span-1 text-[1.04rem]' style={{color:pageStates.mainText}}>Output:</p>
                            <div className={`border-[0.01rem] border-[#000] border-opacity-35 rounded-sm row-span-4`}>
                                <p className='text-left p-2' style={{backgroundColor:pageStates.mainBg,color:pageStates.mainText}}>
                                    {compilerResponse.output}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
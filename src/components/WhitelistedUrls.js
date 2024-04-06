import React, { useState, useEffect} from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

function WhitelistedUrls() {
    const [data, setData] = useState([]);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        const localStorageData = JSON.parse(localStorage.getItem('URL')) || [];
        setData(localStorageData);
    }, []);

    const handleURLChange = (e) => {
        setInputValue(e.target.value);
    }

    const handleAddURL = () => {
        if (inputValue.trim() !== '') {
            const newData = {
                id: Date.now(), // Assign a unique ID
                url: inputValue
            };
            setData(prevData => [...prevData, newData]);
            const localStorageData = [...data, newData];
            localStorage.setItem('URL', JSON.stringify(localStorageData));
            setInputValue('');
        }
    }

    const handleDeleteURL = (id) => {
        const newData = data.filter(item => item.id !== id);
        setData(newData);
        localStorage.setItem('URL', JSON.stringify(newData)); // Update localStorage with newData, not data
    }

    return(
        <>
            <div className="">
                <div className="flex">
                    <TextField
                        sx={{
                            width:'70%'
                        }}
                        label="Input URL"
                        size="small"
                        variant="outlined"
                        onChange={handleURLChange}
                    />
                    <Button 
                        variant="contained"
                        sx={{
                            width:'30%', 
                            marginLeft: '5px',
                            borderRadius:'10',
                            backgroundColor: '#4ade80',
                            boxShadow:'none',
                            '&:hover': {
                                backgroundColor: '#22c55e',
                                boxShadow:'none'
                            },
                        }} 
                        onClick={handleAddURL}
                    >
                        Add URL
                    </Button>
                </div>
                <div class="mt-2 overflow-auto h-50">
                    <table className="min-w-full divide-y divide-gray-200 ">
                        <tbody className="divide-y divide-slate-400">
                            {data.map((row, index) => (
                                <tr key={index}>
                                    <td className="px-1 py-2 whitespace-nowrap text-left text-sm">{row.url}</td>
                                    <td className="px-1 py-2 whitespace-nowrap text-right">
                                        <Button
                                            variant="contained"
                                            onClick={() => handleDeleteURL(row.id)}
                                            sx={{
                                                padding: '5px',
                                                width:'20%', 
                                                borderRadius:'10',
                                                backgroundColor: '#ef4444',
                                                boxShadow:'none',
                                                '&:hover': {
                                                    backgroundColor: '#dc2626',
                                                    boxShadow:'none'
                                                },
                                            }} 
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
export default WhitelistedUrls;
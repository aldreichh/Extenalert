import Button from '@mui/material/Button';
import axios from 'axios';

function ScanWebsite (){

    return (
        <>
            <div className="mt-2 w-full">
                <Button
                    variant="contained"
                    sx={{
                        padding: '5px',
                        width:'100%', 
                        borderRadius:'0',
                        backgroundColor: '#075985',
                        boxShadow:'none',
                        '&:hover': {
                            backgroundColor: '#0c4a6e',
                            boxShadow:'none'
                        },
                    }} 
                > 
                    Scan This Website
                </Button>
            </div>
        </>
    );
}

export default ScanWebsite;
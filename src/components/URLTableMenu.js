import * as React from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import WhitelistedUrls from './WhitelistedUrls';
import ProtectionHistory from './ProtectionHistory';

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 2}}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
}
CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};


function URLTableMenu() {
    const [value, setValue] = React.useState(0);

    const Tab1 = () => {
        setValue(0);
    };
    const Tab2 = () => {
        setValue(1);
    };
    return(
        <>
            <div class="mt-2 h-full w-full">
                <Box sx={{ width: '100%', height:'100%',  backgroundColor:'#e0f2fe', overflow: 'auto'}}>
                    <Box >
                        <Button 
                            sx={{
                                width:'50%', 
                                borderRadius:'0',
                                backgroundColor: value === 1 ? '#38bdf8' : '#e0f2fe',
                                color: value === 1? 'white' : '#38bdf8',
                                boxShadow:'none',
                                '&:hover': {
                                    backgroundColor: value === 0 ? '#e0f2fe' : '#5ac8fa',
                                    boxShadow:'none'
                                },
                                fontSize: '12px'
                            }} 
                            onClick={Tab1}
                            variant="contained">Whitelisted URLs
                        </Button>
                        <Button 
                            sx={{
                                width:'50%', 
                                borderRadius:'0',
                                backgroundColor: value === 1 ? '#e0f2fe' : '#38bdf8',
                                color: value === 1? '#38bdf8' : 'white',
                                boxShadow:'none',
                                '&:hover': {
                                    backgroundColor: value === 1 ? '#e0f2fe' : '#5ac8fa',
                                    boxShadow:'none'
                                },
                                fontSize: '12px'
                            }} 
                            onClick={Tab2}
                            variant="contained">Protection History
                        </Button>
                    </Box>
                    <CustomTabPanel value={value} index={0} className="h-10">
                        <WhitelistedUrls/>                
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={1}>
                        <ProtectionHistory/>
                    </CustomTabPanel>
                </Box>
            </div>
        </>
    );
}

export default URLTableMenu;
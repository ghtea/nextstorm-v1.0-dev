import dotenv from 'dotenv';
import React, { useState, useEffect , useRef } from 'react';
import styled from 'styled-components';

import axios from 'axios';

import { connect } from "react-redux";
import * as config from '../../config';

import addDeleteNotification from "../../redux/thunks/addDeleteNotification";
import dictCode from '../../others/dictCode'

import { replaceData2 } from "../../redux/actions/basic";

import {  NavLink, useHistory } from 'react-router-dom';

import themes from "../../styles/themes"
import { Div, Input, Button } from '../../styles/DefaultStyles';

// for profile of user
import ProfileIcon from "./Profile/ProfileIcon";

const DivProfile = styled(Div)`
  
  width: auto;
  height: ${props => props.size}px;
  
  display: flex;
  flex-direction: 
    ${props => {
        if (!props.layout || props.layout === 'icon only' || props.layout === 'right') {
          return 'row'
        }
        else if (props.layout === 'left') {
          return 'row-reverse'
        }
      }
    };
  justify-content: space-between;
  align-items: center;
  
  & > div:nth-child(2) {
    margin-left: 5px;
  }
`

// ${props => borders[props.border] || borders['Default']}
const DivIcon = styled(Div)`
  
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  
  
  border-radius: 6px; 
  
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  
  cursor: pointer;
`


const DivName = styled(Div)`
    
  font-size: 0.9rem;
  
  width: 70px;
  /*width: 90px;*/

  display: 
    ${props => {
        if (props.layout === 'icon only') {
          return 'none'
        }
        else {
          return 'block'
        }
      }
    };
  
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  
`




const Profile = ({

  language
  , themeName
  
  , idUser
  
  , size
  , layout
  
  , replaceData2
  , addDeleteNotification
}) => {
  
  const [readySomeone, setReadySomeone] = useState(false);
  const [someone, setSomeone] = useState({});
  
  const [battletagName, setBattletagName] = useState("");
	const [battletagNumber, setBattletagNumber] = useState("");
  
  const history = useHistory();
  
  let unmounted = false;
  
  size = size || 40;
  //const sizeUsing = size || 40;
  
  useEffect(()=>{
    return ()=> {
      //console.log("i solve!")
      unmounted = true;
    };
  },[])
  
  
  // important !! https://codesandbox.io/s/l458746w89?from-embed=&file=/src/AxiosHooksComponent.js
  useEffect(() => {
    
    (async() => {
        //console.log('please');
      try {
        
        const resSomeone = await axios.get(`${config.URL_API_NS}/user/public/${idUser}`);
        //console.log(resUser.data.listIdShape)
        
        const someone = resSomeone.data; // 현재 사이트 상의 유저가 아니라, 해당 아이콘의 유저!
        //console.log(someone)
        
        const battletagFull = someone.battletag || '...';
        const regexBattletag = /(#\d*)$/;
  		  const listNumberBattletag = battletagFull.match(regexBattletag) || [""];
  		  
  		  const battletagNameTemp = battletagFull.replace(regexBattletag, "");
  		  const battletagNumberTemp = listNumberBattletag[0];
  		  
  		  if (!unmounted) {
    		  setBattletagName(battletagNameTemp)
      		setBattletagNumber(battletagNumberTemp)
            
          setSomeone(resSomeone.data);
          setReadySomeone(true);
  		  }
        
      } catch (error) {
        if (!unmounted) {
          setReadySomeone(false);
        }
      }
      
    })() // async
    
  }, []);
  
  
  
  const onClick_Icon = (event) => {
    if (readySomeone && someone.battletag) {
      //replaceData2('ready', 'playerBattletag', false);
      //replaceData2('ready', 'playerGeneral', false);
      //replaceData2('ready', 'playerGeneralShowing', false);
      history.push(`/player/general/${encodeURIComponent(someone.battletag)}`);
    }
  }
  
  // Suspense 로 변수를 이용한 컴포넌트 import!
  return (

    <DivProfile size={size} layout={layout} >
      
      {(!readySomeone) &&
        <>
        
          <DivIcon
            size={size} layout={layout}  >
            
            <ProfileIcon 
              width = { `${size-6}px` } height = { `${size-6}px` } 
              shape={"Default"} 
              palette={"Default"} 
              badge={"Default"}
            />

          </DivIcon>
        
          <DivName layout={layout}>
            {(() => {
              switch (language) {
                case 'ko': 
                  return '로딩중';
                case 'ja': 
                  return 'ローディング';
                default: // eng
                  return 'loading'
              }
            })()} 
          </DivName>

        </>
      }
      
      {(readySomeone) &&
        <>
        
          <DivIcon
            onClick={onClick_Icon}
            size={size} layout={layout}  >
            
            <ProfileIcon 
              width = { `${size-6}px` } height = { `${size-6}px` } 
              shape={someone.profile.listIdShape[0]} 
              palette={someone.profile.listIdPalette[0]} 
              badge={someone.profile.listIdBadge[0]}
            />

          </DivIcon>
        
          <DivName layout={layout}>
            {battletagName}
          </DivName>

        </>
      }

    </DivProfile>

  )
}




function mapStateToProps(state) {
  return {

    language: state.basic.language
    , themeName: state.basic.themeName
    
  };
}

function mapDispatchToProps(dispatch) {
  return {
    replaceData2: (which1, which2, replacement) => dispatch(replaceData2(which1, which2, replacement))

    , addDeleteNotification: (code_situation, language, message, time) => dispatch(addDeleteNotification(code_situation, language, message, time))
  };
}

// 컴포넌트에서 redux의 state, dispatch 를 일부분 골라서 이용가능하게 된다
export default connect(mapStateToProps, mapDispatchToProps)(Profile);
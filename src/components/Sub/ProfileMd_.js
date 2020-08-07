import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Media from 'react-media';

import * as config from '../../config';

import { connect } from "react-redux";
import {replaceData} from "../../redux/actions/basic";
import {replaceDataAuth, replaceData2Auth} from "../../redux/actions/auth";

import addDeleteNotification from "../../redux/thunks/addDeleteNotification";
import dictCode from '../../others/dictCode';

import { NavLink } from 'react-router-dom';
import {Div, Button, A, NavLinkDefault} from '../../styles/DefaultStyles';

import IconLogo from '../../svgs/brand/IconLogo';

import IconLoading from '../../svgs/basic/IconLoading';
import IconLogIn from '../../svgs/basic/IconLogIn';
import IconUser from '../../svgs/basic/IconUser';




const DivProfileMd_ = styled(Div)`
	
	height:100%;
	margin: 0;
		
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	align-items: center;
	
	width: 120px; /*  icon + text */
	
	& > * {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
		
		& > * {
			margin-left: 3px;
			margin-right: 3px;
		}
		
	}
	


	& > a {
		width: auto;
	  height: 100%;
	  
	  
		color: ${props => props.theme.color_normal};
		font-weight: regular;
		
		text-decoration: none;
		text-align: center;
		
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
	
		color:  ${props => props.theme.color_normal };
		text-decoration: none;
		font-weight: bold;
	}
	
	/* 글자도 표시 */
	& > * > *:nth-child(2) {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
	}
	
	
	
`

const DivIconProfile = styled(Div)`
	width: 40px;
	height: 40px;
`


const DivBattletag = styled(Div)`
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	align-items: center;
	
	& > div {
		margin-left: 2px;
		margin-right: 2px;
	}
`

const DivBattletagName = styled(Div)`
	width: auto;
	
	font-size: 1rem;
	
	display: block;
	text-algin: left;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	
	
`
const DivBattletagNumber = styled(Div)`
	width: auto;
	padding-top: 1px;
	
	font-size: 0.8rem;
	
	display: block;
	text-algin: left;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
`

const DivEmail = styled(Div)`
	width: 70px;
	
	font-size: 0.8rem;
	
	display: block;
	text-algin: left;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
`


const NavLinkStyled = styled(NavLinkDefault)`
  
	
`;




// img (svg) https://www.svgrepo.com/svg/154720/hexagon
const ProfileMd_ = ({
	match, location
	
	, language
	, auth     // 변화 잘 감지하기 위해서, readyUser 만 따로 빼놓기!
	, loadingUser, readyUser
	
	, themeName
	
	,replaceData, addDeleteNotification
	
	, replaceDataAuth, replaceData2Auth
	}) => {
	
	
	
	const [battletagName, setBattletagName] = useState("");
	const [battletagNumber, setBattletagNumber] = useState("");
 
	
	useEffect(()=>{
		if(readyUser === true && auth.battletag) {
			// 배틀태그를 아직 인증하지 않은 경우도 생각해야 한다. (그 경우 auth.battletag ="")
			
			const regexBattletag = /(#\d*)$/;
		  const listNumberBattletag = auth.battletag.match(regexBattletag);
		  
		  const battletagNameTemp = auth.battletag.replace(regexBattletag, "");
		  const battletagNumberTemp = listNumberBattletag[0];
		  
		  setBattletagName(battletagNameTemp)
		  setBattletagNumber(battletagNumberTemp)
		  //console.log(battletagName, battletagNumber);
		}
	}, [readyUser])
	

	return (
 
	
  <DivProfileMd_>

  	
		{ ( function() {
      if (loadingUser) {
      	return (
      		<A>
        		<DivIconProfile> <IconLoading width={"25px"} height={"25px"} color={"color_weak"} /> </DivIconProfile>
        		<Div> loading </Div>
        	</A>
      	);
    	}
    	else if (!loadingUser && !readyUser) {
      	return (
					<NavLinkStyled to="/auth/log-in" > 
						<DivIconProfile> <IconLogIn width={"25px"} height={"25px"} color={"color_weak"} /> </DivIconProfile>
						<Div> Log In </Div> 
					</NavLinkStyled> 

				);
    	}
    	else {
    		return (
			<NavLinkStyled to="/" >
					<DivIconProfile> <IconUser width={"40px"} height={"40px"} color={"color_weak"} /> </DivIconProfile>
				{(auth.battletag)?
  				<DivBattletag> <DivBattletagName> {battletagName} </DivBattletagName> <DivBattletagNumber> {battletagNumber} </DivBattletagNumber> </DivBattletag> 
				: <DivEmail> {auth.email} </DivEmail>
				}
			</NavLinkStyled>
				)
    	}
    	
		} )() }
  	
		
	</DivProfileMd_>
	
	)
}

function mapStateToProps(state) { 
  return { 
    themeName: state.basic.themeName
    , language: state.basic.language
    
    , auth: state.auth
    

    , loadingUser: state.basic.loading.user
    , readyUser: state.basic.ready.user
  }; 
} 

function mapDispatchToProps(dispatch) { 
  return { 
    replaceData: (which, newThemeName) => dispatch( replaceData(which, newThemeName) ) 
    
    , addDeleteNotification: (code_situation, language, message, time) => dispatch(  addDeleteNotification(code_situation, language, message, time) )
    
    ,replaceDataAuth : (which, replacement) => dispatch(replaceDataAuth(which, replacement))
    ,replaceData2Auth : (which1, which2, replacement) => dispatch(replaceData2Auth(which1, which2, replacement))
  }; 
}


// TableEntry 컴포넌트에서 redux의 state, dispatch 를 일부분 골라서 이용가능하게 된다
export default connect(mapStateToProps, mapDispatchToProps)(ProfileMd_);

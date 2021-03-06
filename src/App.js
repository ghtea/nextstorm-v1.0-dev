import React, {useEffect} from 'react';
import {  BrowserRouter, Route, Switch } from "react-router-dom";
import styled from 'styled-components';
import axios from 'axios';
import queryString from 'query-string';

import { connect } from "react-redux";
import * as config from './config';
import replaceTheme from "./redux/thunks/replaceTheme";
import { useCookies } from 'react-cookie';
import dictCode from './others/dictCode'

import Sub from "./routes/Sub";
import Reaction from "./routes/Reaction";
import Notification from "./routes/Notification";


import Loading from "./components/_/Loading";
import Home from "./routes/Home";

import Basic from "./routes/Basic";
import Player from "./routes/Player";
import Hero from "./routes/Hero";

import Auth from "./routes/Auth";

import TeamPlanner from "./routes/TeamPlanner";

import CompGallery from "./routes/CompGallery";

import {replaceDataHots, replaceData2Hots} from "./redux/actions/hots";
import addDeleteNotification from "./redux/thunks/addDeleteNotification";
import {replaceData, replaceData2} from "./redux/actions/basic";
import {replaceDataAuth, replaceData2Auth} from "./redux/actions/auth";
import storage from './tools/vanilla/storage';

import {language_browser_to_ISO_639_1} from './tools/vanilla/language';
import {ThemeProvider } from 'styled-components';
import themes from "./styles/themes"
import { GlobalStyle, Div} from './styles/DefaultStyles';


// env 사용할때 각변수 앞에 REACT_APP_ 를 붙혀야한다 https://hello-bryan.tistory.com/134

const DivContent = styled(Div)`
  
  opacity: ${props=> (props.visibilityReaction === "visible")? "0.3" : "1.0"  };
  
  width: 100%;
  
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
  margin-top: 50px; /* height of sub */
  
	@media (min-width:  ${props => (props.theme.media.md) }px) {
	 margin-top: 60px; /* height of sub */
	 
	}
  
  
`;


const isDarkMode = () => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return true;
  }
  else {
    return false;
  }
}  


const App = ({
  notification
  
  , user
  , readyUser
  
  , version
  , readyVersion  
  
  ,match, location, history
  
  , themeName, language
  , visibilityReaction
  
  , readyListAllHeroBasic
  , readyListAllHeroDetail
  //, readyListAllHeroStats
  , readyListAllMap
  , readyListMapStandardRanked
  
  , replaceDataHots, replaceData2Hots
  , replaceDataAuth, replaceData2Auth
  , replaceData, replaceData2
  
  , addDeleteNotification
}) => {
  
  const [cookies, setCookie, removeCookie] = useCookies(['logged', 'language', 'themeOption']);
  
  // check cookie 'language', 'theme'
  useEffect(()=>{
    
    const language_browser = navigator.language || navigator.userLanguage;
    console.log(language_browser);
    const language_cookie = cookies.language;
    
    // https://www.metamodpro.com/browser-language-codes
    // https://gist.github.com/wpsmith/7604842
    if (!language_cookie && language_browser) {
      const language_redux = language_browser_to_ISO_639_1(language_browser);
      console.log('language_redux');
      console.log(language_redux);
      replaceData("language", language_redux);
    }
    else if (language_cookie) {
      const language_redux = language_cookie;
      replaceData("language", language_redux);
    }
    
    
    
    const themeOption_cookie = cookies.themeOption;
    if (themeOption_cookie === 'auto' || !themeOption_cookie) {
      const themeName = isDarkMode() ? 'dark' : 'light';
      replaceData("themeOption", 'auto');
      replaceData("themeName", themeName);
    }
    else {
      replaceData("themeOption", themeOption_cookie);
      replaceData("themeName", themeOption_cookie);
    }
    
  },[])
  
  // check query for code_situation
  useEffect(()=>{
    const { code_situation, ...rest } = queryString.parse(location.search);
    
    if (code_situation) {
      
      addDeleteNotification(code_situation, language);
      
      const search = queryString.stringify(rest);
      history.replace({
        ...location,
        search
      });
      /*
      const location = Object.assign({}, browserHistory.getCurrentLocation());
      queryNames.forEach(q => delete location.query[q]);
      browserHistory.push(location);
      */
    }
    
  },[])
  
  
  
  // 유저 업데이트 해서 다시 정보 가져와야 할때 readyUser 를 false 로 바꿔서 아래 것을 유도한다
  // 새로고침할 때마다, 로그인의 흔적이 있으면 감춰진 토큰 이용해서 로그인
  useEffect( () => { 
    
    if (!readyUser) {
      (async () => {
        
      replaceData2('loading', 'user', true);
      replaceData2('ready', 'user', false);
      
      const logged = cookies.logged; // 로그인 정보를 로컬스토리지에서 가져옵니다.
      // 참고로 localStorage 에는 user의 _id 만 저장한다!!! 
      
      if(!logged) {
        console.log("no logged user");
        
        replaceDataAuth("user", {});
        
        replaceData2('loading', 'user', false);
        replaceData2('ready', 'user', false);
      
        return; // 로그인 정보가 없다면 여기서 멈춥니다.
      }; 
      
      
      
      try {
        // 토큰 확인해서 바로 유저 정보 부여!
        const res = await axios.get(`${config.URL_API_NS}/auth-local/check`, {withCredentials: true, credentials: 'include'});
        //console.log("seems not error!")
        
        console.log(res.data);
        
        replaceDataAuth("user", res.data);
        
        replaceData2('loading', 'user', false);
        replaceData2('ready', 'user', true);
        
      } catch (e) { // token 정보가 잘못되었었으면 여기로 이동
        removeCookie('logged');
        window.location.href = '/auth/log-in';
        
        replaceData2('loading', 'user', false);
      }
      
      }) ()
      
    } // if !readyUser
  
  },[readyUser])
  
  
  
  
  useEffect(() => {

    (async() => {

      if (!readyVersion) {

        try {
          
          replaceData2("ready", "version", false);
          
          const { data } = await axios.get(`${config.URL_API_NS}/version` );
          
          console.log(data);
          
          replaceData("version", data);
          replaceData2("ready", "version", true);

        } catch (error) {

          addDeleteNotification("basic01", language);
          console.log(error)
        }
      } // if

    })() // async

  }, [readyVersion])
  
  
  
  
  //  HeroBasic, HeroDetail, HeroStats, Map, MapStandardRanked
  useEffect( () => { 
    (async () => {
      
      if (readyVersion) {
        
        const versionDbFromLocal = storage.get("versionDb");
        let versionDbTemp = versionDbFromLocal || {};
        
        const listAllHeroBasicFromLocal = storage.get("listAllHeroBasic");
        const listAllHeroDetailFromLocal = storage.get("listAllHeroDetail");
        
        const listAllMapFromLocal = storage.get("listAllMap");
        
        
        
        // HeroBasic
        if (!readyListAllHeroBasic) {
          if ( listAllHeroBasicFromLocal ) {
            replaceDataHots("listAllHeroBasic", listAllHeroBasicFromLocal);
            replaceData2("ready", "listAllHeroBasic", true);
          }
          else {
            try {
              const {data} = await axios.get (`${config.URL_API_NS}/hero-basic/`);
              replaceDataHots("listAllHeroBasic", data);
              replaceData2("ready", "listAllHeroBasic", true);
              storage.set("listAllHeroBasic", data);

              versionDbTemp['HeroBasic'] = version['db']['HeroBasic'];
            }
            catch (error) { 
              replaceData2("ready", "listAllHeroBasic", false);
              addDeleteNotification("basic01", language);
              console.log(error) 
            }
          }
        } // HeroBasic
        
        
        // HeroDetail
        if (!readyListAllHeroDetail) {
          if ( listAllHeroDetailFromLocal ) {
            replaceDataHots("listAllHeroDetail", listAllHeroDetailFromLocal);
            replaceData2("ready", "listAllHeroDetail", true);
          }
          else {
            try {
              const {data} = await axios.get (`${config.URL_API_NS}/hero-detail/`);
              replaceDataHots("listAllHeroDetail", data)
              replaceData2("ready", "listAllHeroDetail", true);
              storage.set("listAllHeroDetail", data);
              
              versionDbTemp['HeroDetail'] = version['db']['HeroDetail'];
              
            }
            catch (error) { 
              replaceData2("ready", "listAllHeroDetail", false);
              addDeleteNotification("basic01", language);
              console.log(error) 
            }
          }
        } // HeroDetail
        
        
        
        // Map
        if (!readyListAllMap || !readyListMapStandardRanked) {
          
          if ( listAllMapFromLocal ) {
            replaceDataHots("listAllMap", listAllMapFromLocal);
            replaceData2("ready", "listAllMap", true);
            
            const listMapStandardRankedTemp = listAllMapFromLocal.filter(element => element.type === "standard" && element.rankedRotation === true);
            replaceDataHots( "listMapStandardRanked", listMapStandardRankedTemp );
            replaceData2("ready", "listMapStandardRanked", true);
          }
          
          else { // (listAllMapFromLocal)
        
            try { 
              replaceData2("ready", "listMapStandardRanked", false);
              replaceData2("ready", "listAllMap", false);
              
              const {data} = await axios.get (`${config.URL_API_NS}/map/`);
              
              replaceDataHots("listAllMap", data);
              replaceData2("ready", "listAllMap", true);
              storage.set("listAllMap", data);
              
              versionDbTemp['Map'] = version['db']['Map'];
              
              // 
              const listMapStandardRankedTemp = data.filter(element => element.type === "standard" && element.rankedRotation === true);
              replaceDataHots( "listMapStandardRanked", listMapStandardRankedTemp );
              replaceData2("ready", "listMapStandardRanked", true);
            } 
            catch (error) { 
              replaceData2("ready", "listMapStandardRanked", false);
              replaceData2("ready", "listAllMap", false);
              
              addDeleteNotification("basic01", language);
              console.log(error) 
            }
          }// else  listAllMapFromLocal
        
        } // if map
        
        storage.set("versionDb", versionDbTemp);

      } // readyVersion
      
    }) ()
  
  }, [readyVersion])
  
  
  
  
  return (
    <>
    
    <ThemeProvider theme={themes[themeName]}>
    

    <GlobalStyle/>
    
    <BrowserRouter>
      
      
      <Route path="/" component={Sub} />
      
      <Route path="/" component={Notification} />
      
      <Route path="/" component={Reaction} />
      
      
      <DivContent visibilityReaction={visibilityReaction}>
      
        {(readyListAllHeroBasic && readyListAllHeroDetail && readyListAllMap && readyListMapStandardRanked)? 
          <Switch >
          <Route path="/" exact={true} component={Home} />
          
          <Route path="/auth" component={Auth} />
          
          <Route path="/basic" component={Basic} />
          
          <Route path="/player" component={Player} />
          
          <Route path="/comp-gallery" component={CompGallery} />
          <Route path="/hero" component={Hero} />
          
          <Route path="/team-planner" component={TeamPlanner} />
        </Switch >
          : <Loading/>
        }
        
      </DivContent>
      
      
      
    </BrowserRouter>
    
    
    </ThemeProvider>
    </>
  );

}


function mapStateToProps(state) { 
  return { 
    notification: state.basic.notification
    
    , user: state.auth.user
    , readyUser: state.basic.ready.user
    
    , version: state.basic.version
    , readyVersion: state.basic.ready.version
    
    , themeName: state.basic.themeName
    , language: state.basic.language
    
    , visibilityReaction: state.reaction.visibility
    
    
    
    , readyListAllHeroBasic: state.basic.ready.listAllHeroBasic
    , readyListAllHeroDetail: state.basic.ready.listAllHeroDetail
    //, readyListAllHeroStats: state.basic.ready.listAllHeroStats
    , readyListAllMap: state.basic.ready.listAllMap
    
    , readyListMapStandardRanked: state.basic.ready.listMapStandardRanked
  }; 
} 

function mapDispatchToProps(dispatch) { 
  return { 
    replaceTheme: (themeName) => dispatch(replaceTheme(themeName)) 
    
    
    , replaceDataHots : (which, replacement) => dispatch(replaceDataHots(which, replacement))
    , replaceData2Hots : (which1, which2, replacement) => dispatch(replaceData2Hots(which1, which2, replacement))
    
    ,replaceDataAuth : (which, replacement) => dispatch(replaceDataAuth(which, replacement))
    ,replaceData2Auth : (which1, which2, replacement) => dispatch(replaceData2Auth(which1, which2, replacement))
    
    ,replaceData : (which, replacement) => dispatch(replaceData(which, replacement))
    ,replaceData2 : (which1, which2, replacement) => dispatch(replaceData2(which1, which2, replacement))
    
    ,addDeleteNotification: (code_situation, language, message, time) => dispatch( addDeleteNotification(code_situation, language, message, time))
  }; 
}

// Home 컴포넌트에서 redux의 state, dispatch 를 일부분 골라서 이용가능하게 된다
export default connect(mapStateToProps, mapDispatchToProps)(App);
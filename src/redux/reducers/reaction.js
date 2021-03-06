import {getTimeStamp} from '../../tools/vanilla/time'
import {toggleArrayElement} from '../../tools/vanilla/array'
import storage from '../../tools/vanilla/storage';

import * as types from '../actions/ActionTypes';


const stateInitial = { 
  
  visibility: "hidden"
  , mode: "create" // create, edit, 
  , which: "comment" // comment, video
  
  , authorReaction: ""
  , idReaction: ""
  , idSubject: ""
  , modelSubject: ""
  
  
  , comment: {
    content: ""
  } 
  
  , video: { 
    urlContent: ""
  } 
  
};



const reaction = (
  
  // 기본값 설정
  state = stateInitial, 
  
  // 액션별로 새로운 state 반환하기
  action) => {
    
  switch (action.type) {
    
    case types.REPLACE_DATA_REACTION:
      
      let replacementState = {};
      
      if ( (!!action.replacement) && (action.replacement.constructor === Array) ) {
        replacementState = {
      	...state, 
      	[action.which]: [...action.replacement]
        }
      }
      
      else if ( (!!action.replacement) && (action.replacement.constructor === Object) ) {
        replacementState =  {
      	...state, 
      	[action.which]: {...action.replacement}
        }
      }
      else {
        replacementState =  {
        	...state, 
        	[action.which]: action.replacement
        }
      }
      
      
      
      return replacementState;
      
    
    case types.REPLACE_DATA_2_REACTION:
      
      let replacementState2 = {};
      if ( (!!action.replacement) && (action.replacement.constructor === Array) ) {
        
        replacementState2 = {
        	...state, 
        	[action.which1]: {
        	  ...state[action.which1]
        	  ,[action.which2]: [...action.replacement]
        	}
        }
      }
      
      else if ( (!!action.replacement) && (action.replacement.constructor === Object) ) {
        replacementState2 = {
        	...state, 
        	[action.which1]: {
        	  ...state[action.which1]
        	  ,[action.which2]: {...action.replacement}
        	}
        }
      }
      
      else {
        replacementState2 = {
        	...state, 
        	[action.which1]: {
        	  ...state[action.which1]
        	  ,[action.which2]: action.replacement
        	}
        }
      }
      
      
      /* 새로고침해도 안날라가게 저장 */
      if (action.which === "comment") {
        storage.set( 'comment_content' , replacementState.comment.content);
      }
      else if (action.which === "video") {
        storage.set( 'video_urlContent', replacementState.video.urlContent);
      }
      
      return replacementState2;
    // 
      
      
      
    default:
      return state;
  }
};


export default reaction;

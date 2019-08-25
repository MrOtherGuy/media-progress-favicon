
const handleMutedChange = (tabId, changeInfo, tabInfo) => {
    if(changeInfo.audible){
      //addContentScript({tabId:tabId});
      //addFrameScript({tabId:tabId,allFrames:true});
      addScript({tabId:tabId});
      addScript({tabId:tabId,allFrames:true});
    }
	};

function addScript(details){
  let scriptFile = details.allFrames ? "frame_script.js" : "content_script.js";
  
  browser.tabs.executeScript(details.tabId,{ file: scriptFile, allFrames: !!details.allFrames });
  
}
/*
function addContentScript(details){
  
  let scriptDetails = { file:"content_script.js", allFrames:false }
  
  browser.tabs.executeScript(details.tabId,scriptDetails);
}*/
/*
function addFrameScript(details){
		const file = "frame_script.js";
		//let newState = !this.paused;
		let scriptDetails = { file: file, allFrames: details.allFrames };
    browser.tabs.executeScript(details.tabId,scriptDetails);
		browser.tabs.executeScript(details.tabId, scriptDetails).then(async (results)=>{
			for(let result of results){
				if (result.progress){
          result.value
          break;
				}
			}
		},(e)=>{
		});
	}*/


	const handleMessage = (request,sender) => {
		if(sender.id != browser.runtime.id){
			return
		}
		switch(sender.envType){
			// From content asking for tab status
			case "content_child":
				//(request.progress === "isPaused") && sendResponse({paused:SBtabs.get(sender.tab.id).paused, frameId:sender.frameId});
				browser.tabs.sendMessage(sender.tab.id,request.progress/*,{frameId:-1}*/);
        break;
			// update options based on message from options document
			case "addon_child":
				setOptions(request.SBOptions);
				break;
			default:
				console.log("unhandled message from:" + sender.envType);
		}
		return
	};

browser.runtime.onMessage.addListener(handleMessage);

browser.tabs.onUpdated.addListener(handleMutedChange,{properties:["audible"]});
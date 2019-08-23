
const handleMutedChange = (tabId, changeInfo, tabInfo) => {
		/*if(changeInfo.audible === undefined && changeInfo.mutedInfo === undefined){
				console.log("This should never happen on Firefox 61+")
				return
		}
		else{
			handleUpdated(tabId,changeInfo);
		}*/
    if(changeInfo.audible){
      addContentScript({tabId:tabId});
      addFrameScript({tabId:tabId,allFrames:true});
    }
	};

function addContentScript(details){
  
  let scriptDetails = { file:"content_script.js", allFrames:false }
  
  browser.tabs.executeScript(details.tabId,scriptDetails);
}

function addFrameScript(details){
		const file = "frame_script.js";
		//let newState = !this.paused;
		let scriptDetails = { file: file, allFrames: details.allFrames };
		// allFrames is forced when the specified frame doesn't exist anymore
		/*if(forceAllFrames || newState){
			details = { file: file, allFrames: true };
		}else{
			details = { file: file, frameId: this.frameId };
		}*/
		browser.tabs.executeScript(details.tabId, scriptDetails).then(async (results)=>{
			for(let result of results){
				if (result.progress){
          result.value
          break;
					/*this.set("paused", newState);
					this.frameId = !newState ? null : results.length === 1 ? 0 : result.frameId;
					break;*/
				}
			}
		},(e)=>{
			// Handle the case where a frame doesn't exist anymore
		/*console.log("Frame has been removed, proceed to toggle all frames");
		if(!(forceAllFrames || newState)){
			window.setTimeout(()=>(addContentScript({ tabId:details.tabId, allFrames:true })),20);
		}*/
		});
	}


	const handleMessage = (request,sender,sendResponse) => {
		if(sender.id != browser.runtime.id){
			return
		}
		switch(sender.envType){
			// From content asking for tab status
			case "content_child":
				(request.progress === "isPaused") && sendResponse({paused:SBtabs.get(sender.tab.id).paused, frameId:sender.frameId});
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

browser.tabs.onUpdated.addListener(handleMutedChange,{properties:["audible"]});
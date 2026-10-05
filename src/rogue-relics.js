/* Boss-clear choices reuse the guarded, two-step reward interaction. */
const RogueRelics={
  open(){if(!intermission)return;if(player.dead){player.dead=false;player.hp=Math.ceil(player.maxHp*.3);resetSpectateState();}mazeState={postBoss:true,kind:boss.kind,sequence:runState.mazeCount,theme:{name:intermission.name},rewardOptions:chooseMazeRewards(hashString(boss.kind+":"+clearedBosses.length)),rewardPending:true,rewardChosen:false};showMazeRewardChoices();RogueGame.saveCheckpoint();Arcade.setText(ui.mazeRewardTitle,"Boss cleared · choose a run relic");Arcade.setText(ui.status,"This relic lasts until the run ends. Permanent upgrades unlock afterward.");},
  updateReady(){if(!intermission)return;const ready=!isPartySyncActive()||partyPlayerIds().every(id=>intermission.ready?.has(id));document.getElementById("continueButton").disabled=!ready||isPartySyncActive()&&!isMultiplayerHost();if(!ready)Arcade.setText(document.getElementById("resultsSummary"),"Waiting for teammates to confirm their relics · "+Arcade.progress.total()+" Marks earned so far.");}
};
function installRogueRelics(){
  const oldResults=showEncounterResults,oldApply=applyMazeRewardChoice,oldContinue=continueArcadeRun,oldRender=renderArcadeUi;
  showEncounterResults=function(final){if(final||RogueGame.finished)return oldResults(final);if(intermission?.relicChosen)return oldResults(false);RogueRelics.open();};
  applyMazeRewardChoice=function(id){if(!mazeState?.postBoss)return oldApply(id);const reward=mazeState.rewardOptions.find(r=>r.id===id);if(!reward||mazeState.rewardChosen||!intermission)return;mazeState.rewardChosen=true;mazeState.rewardPending=false;
    for(const [key,value] of Object.entries(reward.values)){if(key==="potion")player.potions=Math.min(3,player.potions+value);else runState.mazeBuffs[key]=(runState.mazeBuffs[key]||0)+value;}applyGear();intermission.relicChosen=true;intermission.ready ||= new Set();intermission.ready.add(multiplayer.id||"solo");Arcade.screens.close(true);oldResults(false);
    if(isPartySyncActive())sendMultiplayerEvent({kind:"relic-ready",phaseSeq:multiplayer.phaseSeq,bossKind:boss.kind});RogueRelics.updateReady();RogueGame.saveCheckpoint();
  };
  continueArcadeRun=function(){if(intermission&&!RogueGame.finished){if(!intermission.relicChosen)return;if(isPartySyncActive()&&!partyPlayerIds().every(id=>intermission.ready?.has(id)))return;}return oldContinue();};
  renderArcadeUi=function(){oldRender();if(intermission&&!RogueGame.finished&&intermission.relicChosen)RogueRelics.updateReady();};
}

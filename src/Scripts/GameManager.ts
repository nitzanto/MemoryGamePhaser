import { isContext } from "vm";
import MainScene from "../Scenes/MainScene";

/**
 * Use this class for main implementation.
 *
 */
export class GameManager {
  sceneManger: MainScene;

  constructor(i_Scene: MainScene) {
    this.sceneManger = i_Scene;
  }
}

import {fromEvent, timer} from 'rxjs';

import * as implement from './ik/implement';
import {IKRenderer} from './IKRenderer';
import * as Renderer from './renderer';

let ikRenderer: IKRenderer;

fromEvent(window, 'load').subscribe(() => {
  ikRenderer = new IKRenderer(new Renderer.AvatarRenderer());

  // in local demo, avatar renderer has to load avatar assets
  // so, wait for a second for assets loaded
  timer(1000).subscribe(() => {
    ikRenderer.setIK(new implement.HumanoidVRM());
    ikRenderer.setDebug(true);
    ikRenderer.run();
  });
});

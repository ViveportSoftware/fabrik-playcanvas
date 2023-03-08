import {fromEvent, timer} from 'rxjs';

import * as Demo from './demo';
import {IKRenderer} from './IKRenderer';
import * as Renderer from './renderer';

let ikRenderer: IKRenderer;

fromEvent(window, 'load').subscribe(() => {
  // ikRenderer = new IKRenderer(new Renderer.Renderer());
  ikRenderer = new IKRenderer(new Renderer.AvatarRenderer());

  // wait for a second to load avatar VRM asset
  timer(1000).subscribe(() => {
    // ikRenderer.setIK(new Demo.IKDemo01());
    // ikRenderer.setIK(new Demo.IKDemoGlobalHinge01());
    // ikRenderer.setIK(new Demo.IKDemoGlobalHinge02());
    // ikRenderer.setIK(new Demo.IKDemoLocalHinge());
    // ikRenderer.setIK(new Demo.IKDemoRobotLeg());
    ikRenderer.setIK(new Demo.IKDemoHumanoidVRM());
    ikRenderer.run();
  });
});

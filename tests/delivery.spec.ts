import {test,expect} from '@playwright/test';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {fresh,STORAGE_KEY} from '../src/storage';
import {newGame} from '../src/game';
import {lessonById} from '../src/lessons';

test('Standalone file works without HTTP requests and restores saved play',async({page})=>{
 const urls:string[]=[];page.on('request',r=>{if(/^https?:/.test(r.url()))urls.push(r.url());});
 await page.goto(pathToFileURL(path.resolve('dist/animal-picnic.html')).href);
 await page.getByRole('button',{name:'Тоглож эхлэх',exact:true}).click();
 await expect(page.getByTestId('item-2')).toBeEnabled({timeout:12000});
 await page.getByTestId('item-2').click();await page.getByTestId('plate-0').click();
 await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).game.locations,STORAGE_KEY)).toEqual([0,1,0,-1]);
 await page.reload();await page.getByRole('button',{name:'Үргэлжлүүлэх',exact:true}).click();
 await expect(page.getByTestId('item-2')).toHaveAttribute('aria-label',/1-р тавагт/);
 expect(urls).toEqual([]);
});
test('WebGL unavailable still exposes explanatory fallback and playable keyboard controls',async({page})=>{
 await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...rest:any[]){if(type.includes('webgl'))return null;return (get as any).call(this,type,...rest);} as typeof get;});
 await page.goto('/');await page.getByRole('button',{name:'Тоглож эхлэх',exact:true}).click();
 await expect(page.getByText('3D дүрслэл нээгдсэнгүй.',{exact:true})).toBeVisible();
 await page.getByText('Товчлуураар тоглох',{exact:true}).click();
 const item=page.getByRole('group',{name:'Хоол сонгох'}).getByRole('button').nth(2);await expect(item).toBeEnabled({timeout:12000});
 await item.click();await page.getByRole('button',{name:'1-р таваг · 1',exact:true}).click();
 await expect(page.getByRole('button',{name:'1-р таваг · 2',exact:true})).toBeVisible();
});
test('Physical touchscreen drag and cancel keep all twelve items',async({page},info)=>{
 test.skip(info.project.name!=='mobile','Touchscreen project only');
 const data=fresh();data.game=newGame(lessonById('share-4'));
 await page.addInitScript(({key,data})=>localStorage.setItem(key,JSON.stringify(data)),{key:STORAGE_KEY,data});
 await page.goto('/');await page.getByRole('button',{name:'Үргэлжлүүлэх',exact:true}).click();
 await expect(page.getByTestId('item-11')).toBeVisible();
 const source=page.getByTestId('item-0'),dest=page.getByTestId('zone-0');await source.scrollIntoViewIfNeeded();
 const from=await source.boundingBox(),to=await dest.boundingBox();if(!from||!to)throw Error('Missing geometry');
 const cdp=await page.context().newCDPSession(page);
 const point=(x:number,y:number)=>[{x,y,id:1,radiusX:5,radiusY:5,force:1}];
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:point(from.x+22,from.y+22)});
 for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:point(from.x+22+(to.x+to.width/2-from.x-22)*i/8,from.y+22+(to.y+to.height/2-from.y-22)*i/8)});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).game.locations[0],STORAGE_KEY)).toBe(0);
 expect(await page.getByTestId('scene').locator('.food-handle').count()).toBe(12);
 const second=await page.getByTestId('item-1').boundingBox();if(!second)throw Error('Missing second item');
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:point(second.x+22,second.y+22)});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:point(second.x+30,second.y-25)});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).game.locations[1],STORAGE_KEY)).toBe(-1);
 for(let i=1;i<12;i++){await page.getByTestId(`item-${i}`).tap();await page.getByTestId(`plate-${i%3}`).tap();}
 await page.getByRole('button',{name:'Шалгах',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Амьтан бүр хэдийг авсан бэ?'})).toBeVisible();
 await page.screenshot({path:'test-results/twelve-touch-mobile.png',fullPage:true});
 await cdp.detach();
});

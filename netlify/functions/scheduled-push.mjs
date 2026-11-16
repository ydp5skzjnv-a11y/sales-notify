import { tick } from './_scheduler.mjs';
export default async () => {const result=await tick(); console.log('Scheduled push:',JSON.stringify(result));};
export const config = {schedule:'* * * * *'};

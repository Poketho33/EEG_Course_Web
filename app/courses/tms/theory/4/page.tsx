import 'server-only'

import ClientSide from './clientSide';
import HeadTMS from '@/lib/plotData/3D_head/TMS'
import 'katex/dist/katex.min.css';

export default async function TMS_Theory() {

  return (
    <div className="px-8 py-12 space-y-6">
      <h1 className='text-2xl max-w-[500px] font-bold mb-8'>
        <span className='text-lg opacity-60'>tDCS - Theoretical Background: </span>
        <br />
        Part 2.3 - 3D Multi-Layer Head Model
      </h1>
      <ClientSide/>
      <HeadTMS/>
    </div>
  );
}
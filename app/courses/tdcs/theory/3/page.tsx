import 'server-only'

import ClientSide from './clientSide';
import Shells from '@/lib/plotData/3D_spherical/Shells'
import 'katex/dist/katex.min.css';

export default async function TMS_Theory() {

  return (
    <div className="px-8 py-12 space-y-6">
      <h1 className='text-2xl max-w-[500px] font-bold mb-8'>
        <span className='text-lg opacity-60'>tDCS - Theoretical Background: </span>
        <br />
        Part 2.2 - 3D Multiple-Shell Spherical Medium
      </h1>
      <ClientSide/>
      <Shells/>
    </div>
  );
}
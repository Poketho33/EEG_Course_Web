import 'server-only'

import ClientSide from './clientSide';
import Shells from '@/lib/plotData/3D_spherical/Shells'

// import { promises as fs } from 'fs';

export default async function TMS_Theory() {
  // const file = await fs.readFile(process.cwd() + '/simnibs_mesh_data.json', 'utf8');
  // const data = JSON.parse(file);

  return (
    <div className="px-8 py-12 space-y-6">
      <h1 className='text-2xl max-w-[500px] font-bold mb-8'>
        <span className='text-lg opacity-60'>tDCS - Theoretical Background: </span>
        <br />
        Part 2.1 - 3D Homogeneous Spherical Medium
      </h1>
      <Shells/>
      <ClientSide/>
    </div>
  );
}
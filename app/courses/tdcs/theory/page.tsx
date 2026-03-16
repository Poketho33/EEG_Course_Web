import 'server-only'

import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

import Derivation from "@/components/Derivation";
import Plot_2D_Const from "@/components/Plot_2D_Const";

export default async function TMS_Theory() {
  return (
    <div className="px-8 py-12 space-y-6">
      <div className="space-y-6 max-w-[600px]">
        <h1 className='text-2xl max-w-[500px] font-bold mb-8'>
            <span className='text-lg opacity-60'>tDCS - Theoretical Background: </span>
            <br />
            Part 1 - 2D Homogeneous Circular Medium
        </h1>

        <p className=''>
            The physical principles behind tDCS are provided in order of progressive difficulty.
            As a starting point, the potential and electric field are calculated for a 2D homogeneous circular medium.
        </p>

        <p className="">
            Within the body, the potential distribution is governed by the Laplace PDE:
        </p>

        <BlockMath math="\nabla \cdot (\sigma \nabla \phi) = \nabla^2 \phi = 0" />

        <Derivation/>

      </div>
      <Plot_2D_Const/>
    </div>
  );
}
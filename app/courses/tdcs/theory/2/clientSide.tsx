'use client'

import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

import Derivation from "@/components/Derivation";

import Plot_Single from "@/components/Plot_3D_test";

export default function ClientSide() {



    return (
        <div className="">
            <Plot_Single />
        </div>
    );
}
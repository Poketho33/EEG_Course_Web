'use client'

import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

import Derivation from "@/components/Derivation";
import Plot_2D_Const from "@/components/Plot_2D_Const";

export default function ClientSide() {
    return (
        <div className="space-y-6">
            <div className="space-y-6 max-w-[600px]">
                <p>
                    The physical principles behind tDCS are provided in order of progressive difficulty.
                    As a starting point, the potential and electric field are calculated for a 2D homogeneous circular medium.
                </p>

                <p>
                    Within the body, the potential distribution is governed by the Laplace PDE:
                </p>

                <BlockMath math="\nabla \cdot (\sigma \nabla \phi) = \nabla^2 \phi = 0 = \frac {1} {r} \frac {\delta} {\delta r} (r \frac {\delta \phi} {\delta r}) + \frac {1} {r^2} \frac {\delta^2 \phi} {\delta \theta^2}" />

                <Derivation>
                    <p>
                        In a homogeneous medium <InlineMath math="\sigma" /> is a constant, so it can be divided out.
                    </p>
                </Derivation>

                <p>
                    The Laplace PDE can be solved using seperation of variables: <InlineMath math="\phi (r, \theta) = R(r) \Theta(\theta)" />.
                    Solving results in the following formula:
                </p>

                <BlockMath math="R'' \Theta + \frac {1} {r} R' \Theta + \frac {1} {r^2} R \Theta'' = 0"/>

                <Derivation>
                    <BlockMath math="\frac {1} {r} \frac {\delta} {\delta r} (r \Theta R') + \frac {1} {r^2} R \Theta'' = 0" />
                    <BlockMath math="\frac {1} {r} (\Theta R' + r \Theta R'') + \frac {1} {r^2} R \Theta'' = 0" />
                </Derivation>

                <p>
                    Rewritten the formula provides a way to be written into 2 seperate ODEs using a seperation constant <InlineMath math="n^2" />.
                </p>

                <BlockMath math="\frac {r^2R'' +rR'}{R} = -\frac {\Theta''}{\Theta} = n^2"/>

                <p>
                    This trades one PDE in two variables for two ODEs, each solvable independently with their own boundary conditions.
                </p>
            </div>
            <Plot_2D_Const />
        </div>
    );
}
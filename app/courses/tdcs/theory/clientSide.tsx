'use client'

import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

import Derivation from "@/components/Derivation";
import Plot_2D_Const from "@/components/Plot_2D_Const";

export default function ClientSide() {
    return (
        <div className="space-y-6 relative">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="190 120 690 590" fill="none"
                className='absolute top-0 right-3 w-[300px] stroke-foreground'
            >
                <circle cx="530" cy="411" r="220" strokeOpacity="0.7" strokeWidth="10" />
                <path d="M741.023 331.195C743.302 332.431 747.452 336.588 752.552 341.681C757.113 346.237 759.112 352.392 761.612 359.568C763.943 366.257 764.53 373.403 765.364 389.251C767.264 425.386 763.919 432.064 761.113 440.812C757.988 450.557 752.483 460.378 748.217 471.698C747.271 474.328 746.654 475.77 745.82 476.925C744.987 478.08 743.957 478.904 739.775 481.625" stroke="#A4D0FF" strokeWidth="20" strokeLinecap="round" />
                <path d="M321.897 486.43C319.619 485.194 315.468 481.037 310.369 475.944C305.808 471.389 303.808 465.233 301.308 458.058C298.978 451.368 298.39 444.222 297.557 428.374C295.657 392.239 299.002 385.561 301.808 376.813C304.933 367.068 310.437 357.248 314.704 345.928C315.649 343.297 316.267 341.855 317.101 340.7C317.934 339.545 318.964 338.721 323.146 336" stroke="#A4D0FF" strokeWidth="20" strokeLinecap="round" />
                <path d="M774.73 395.487C777.208 394.869 787.151 391.554 813.324 387.803C830.599 385.327 839.783 378.671 849.389 370.972C862.679 360.32 863.552 349.971 865.132 341.216C867.069 330.475 859.632 323.318 852.782 313.755C846.621 305.155 834.927 289.886 827.908 274.656C821.838 261.484 826.525 253.408 829.334 246.748C830.27 244.869 831.506 242.809 832.452 241.027C833.398 239.245 834.016 237.803 835.276 235.693" stroke="#A4D0FF" strokeWidth="10" strokeLinecap="round" />
                <path d="M293.477 416.709C290.999 416.709 284.352 417.121 278.103 416.712C269.654 416.16 258.76 408.408 252.515 404.138C243.561 398.017 236.9 390.93 233.461 381.177C229.089 368.78 236.875 361.805 238.851 356.497C241.597 349.117 243.33 343.08 243.027 328.967C242.777 317.314 233.592 311.258 227.335 305.828C222.265 301.429 216.527 296.477 210.176 291.478C204.6 287.088 200.897 282.108 199.443 278.891C196.26 271.849 198.8 259.263 202.12 250.599C205.017 246.554 208.568 243.196 213.128 239.882C215.834 237.803 219.336 234.919 222.943 231.948" stroke="#A4D0FF" strokeWidth="10" strokeLinecap="round" />
                <path d="M262.364 174.341V181.841H231.818V174.341H262.364ZM300.929 143.182V213H292.474V152.045H292.065L275.02 163.364V154.773L292.474 143.182H300.929Z" className='fill-foreground' />
                <path d="M794.818 200.727V155.727H802.455V200.727H794.818ZM776.136 182.045V174.409H821.136V182.045H776.136ZM862.054 143.182V213H853.599V152.045H853.19L836.145 163.364V154.773L853.599 143.182H862.054Z" className='fill-foreground'/>
                <line x1="532.5" y1="124" x2="532.5" y2="697.043" strokeOpacity="0.3" strokeWidth="5" strokeDasharray="20 20" />
                <line x1="246" y1="408.5" x2="819.043" y2="408.5" strokeOpacity="0.3" strokeWidth="5" strokeDasharray="20 20" />
                <line x1="532.012" y1="408.703" x2="825.012" y2="282.703" strokeOpacity="0.3" strokeWidth="5" strokeDasharray="20 20" />
                <path d="M597.242 382.826C598.142 383.206 599.735 384.174 600.956 385.531C601.699 386.357 602.103 387.268 602.469 388.207C602.928 389.382 603.076 390.601 603.459 393.358C603.722 395.25 603.704 397.193 603.6 398.663C603.526 399.709 603.427 400.816 603.132 401.652C602.839 401.965 602.627 402.347 602.575 403.004C602.557 403.421 602.557 404.005 602.453 404.712" strokeWidth="5" strokeLinecap="round" />
                <path d="M623.648 397.273C622.557 397.261 621.605 396.966 620.793 396.386C619.98 395.801 619.349 394.997 618.901 393.974C618.452 392.952 618.227 391.778 618.227 390.455C618.227 389.142 618.463 387.983 618.935 386.977C619.412 385.966 620.068 385.173 620.903 384.599C621.739 384.026 622.699 383.739 623.784 383.739C624.58 383.739 625.267 383.892 625.847 384.199C626.426 384.5 626.918 384.92 627.321 385.46C627.73 386 628.074 386.619 628.352 387.318H629.136L629.443 390.42L631.148 397H629.273L627.67 390.42C627.585 390.006 627.455 389.523 627.278 388.972C627.102 388.42 626.866 387.884 626.571 387.361C626.276 386.838 625.898 386.406 625.438 386.065C624.983 385.719 624.432 385.545 623.784 385.545C623.091 385.545 622.477 385.756 621.943 386.176C621.409 386.597 620.991 387.179 620.69 387.923C620.389 388.668 620.239 389.523 620.239 390.489C620.239 391.432 620.381 392.281 620.665 393.037C620.949 393.787 621.347 394.381 621.858 394.818C622.369 395.25 622.966 395.466 623.648 395.466C624.278 395.466 624.827 395.293 625.293 394.946C625.759 394.594 626.151 394.153 626.469 393.625C626.787 393.091 627.043 392.543 627.236 391.98C627.435 391.412 627.58 390.915 627.67 390.489L629.102 383.909H630.977L629.443 390.489L629.136 393.693H628.455C628.159 394.398 627.79 395.023 627.347 395.568C626.909 396.108 626.384 396.528 625.77 396.83C625.162 397.131 624.455 397.278 623.648 397.273Z"/>
            </svg>


            <div className="space-y-6 max-w-[600px]">
                <p>
                    The physical principles behind tDCS are provided in order of progressive difficulty.
                    As a starting point, the potential and electric field are calculated for a 2D homogeneous circular medium.
                    The simplified diagram is shown on the right.
                </p>

                <p>
                    Within the body, the potential distribution is governed by the Laplace PDE:
                </p>

                <BlockMath math="\nabla \cdot (\sigma \nabla \phi) = \nabla^2 \phi = 0 = \frac {1} {r} \frac {\partial} {\partial r} (r \frac{\partial \phi}{\partial r}) + \frac {1} {r^2} \frac {\partial^2 \phi} {\partial \theta^2}" />

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
                    <BlockMath math="\frac {1} {r} \frac {\partial} {\partial r} (r \Theta R') + \frac {1} {r^2} R \Theta'' = 0" />
                    <BlockMath math="\frac {1} {r} (\Theta R' + r \Theta R'') + \frac {1} {r^2} R \Theta'' = 0" />
                </Derivation>

                <p>
                    Rewritten the formula provides a way to be written into 2 seperate ODEs using a seperation constant <InlineMath math="n^2" />.
                </p>

                <BlockMath math="\frac {r^2R'' +rR'}{R} = -\frac {\Theta''}{\Theta} = n^2"/>

                <div className="space-y-2">
                    <p>
                        This trades one PDE in two variables for two ODEs, each solvable independently.
                    </p>
                    <p className="">
                        <span className='font-bold'>Angular: </span>
                        <InlineMath math="\Theta'' + n^2 \Theta = 0" />
                        {", which is a linear second-order differential equation. It has solutions "}
                    </p>
                    <BlockMath math="\Theta(\theta) = A \cos(n \theta) + B \sin(n \theta); \quad n = 0, 1, 2, ..." />
                    <p className="">
                        <span className='font-bold'>Radial: </span>
                        <InlineMath math="r^2 R'' + r R' - n^2 R = 0" />
                        {", which  has solutions "}
                    </p>
                    <BlockMath math="R(r) = C + D \ln(r); \quad n = 0" />
                    <BlockMath math="R(r) = E r^n + F r^{-n}; \quad n = 1, 2, ..." />
                    <p>
                        {"The radial solutions must not blow up at the origin, so "}
                        <InlineMath math='D = 0, F = 0'/>
                        .
                    </p>
                </div>

                <p>
                    The individual ODEs can be put back together to get a solution for the potential field. 
                    The potential field is representing a Fourier series.
                </p>

                <BlockMath math="\phi(r,\theta) = C_0 + \sum_{n=1}^{\infty} r^n (A_n \cos(n\theta) + B_n \sin(n\theta))" />
                
                <p>
                    <InlineMath math='C_0' />
                    {" can be set to 0 as the relative scalar. Additionally, "}
                    <InlineMath math='E' />
                    {" is absorbed by "}
                    <InlineMath math='A_n, B_n' />
                    {". These can be found by applying the Neumann boundary condition:"}
                </p>

                <BlockMath math="\sigma \frac{\partial \phi}{\partial r}\bigg|_{r=R} = J(\theta) = 
                \sigma \sum_{n=1}^{\infty} n R^{n-1} (A_n \cos(n \theta) + B_n \sin(n \theta))" />

                <p>
                    The coefficients can be found by the standard Fourier coefficient integrals:
                </p>

                <BlockMath math="A_n = \frac {1}{\sigma n R^{n-1} \pi} \int_{0}^{2 \pi} J(\theta) \cos(n \theta) d \theta" />
                <BlockMath math="B_n = \frac {1}{\sigma n R^{n-1} \pi} \int_{0}^{2 \pi} J(\theta) \sin(n \theta) d \theta" />
                
            </div>
            <Derivation>
                <p>
                    The orthogonality of sinusoids is used:
                </p>
                <BlockMath math='\int_0^{2\pi} J(\theta) \cos(m\theta)\, d\theta = \sum_{n=1}^{\infty} \left[ \alpha_n \underbrace{\int_0^{2\pi} \cos(n\theta)\cos(m\theta)\,d\theta}_{\pi \,\delta_{nm}} + \beta_n \underbrace{\int_0^{2\pi} \sin(n\theta)\cos(m\theta)\,d\theta}_{0} \right]'/>
                <BlockMath math='\int_0^{2\pi} J(\theta) \cos(m\theta)\, d\theta = \alpha_m \pi = \sigma m R^{m-1} A_m \pi' />
                <p className="">
                    Due to the dummy natures of m and n, the m is replaced with n for the final solution.
                </p>
            </Derivation>

            <div className="space-y-6 max-w-[600px]">
                <p className="">
                    The final result is presented in an interactive plot. The explanation and calculation are given under it.
                </p>
                
            </div>

            <Plot_2D_Const />
        </div>
    );
}
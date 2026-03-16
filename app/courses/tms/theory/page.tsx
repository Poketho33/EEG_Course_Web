import 'server-only'

import Plot_2D_Const from "@/components/Plot_2D_Const";

export default async function TMS_Theory() {
  return (
    <div className="">
      <div className="px-8 py-12 gap-2">
        <h1 className='text-2xl max-w-[500px] font-bold'>
          Theoretical Background
        </h1>

        <Plot_2D_Const/>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";

// The whole site IS the hackathon microsite. Middleware rewrites "/" to
// "/hackathon"; this is a build-time fallback so "/" always resolves.
export default function RootPage() {
    redirect("/hackathon");
}

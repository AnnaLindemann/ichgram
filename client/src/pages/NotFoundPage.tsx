import BackgroundImg from "@/assets/images/Background.png";
import { NavLink } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-5xl px-4 py-12 lg:py-16">
        <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:gap-12">
          <NavLink to="/" className="block w-full max-w-[260px] lg:max-w-[320px]">
            <img
              src={BackgroundImg}
              alt="Image of mobilphones"
              className="h-auto w-full select-none object-contain"
            />
          </NavLink>

          <div className="w-full max-w-xl">
            <h2 className="text-3xl font-semibold tracking-tight">
              Oops! Page Not Found (404 Error)
            </h2>

            <p className="mt-4 text-base leading-7 text-muted-foreground">
              We&apos;re sorry, but the page you&apos;re looking for doesn&apos;t seem to exist.
              If you typed the URL manually, please double-check the spelling.
              If you clicked on a link, it may be outdated or broken.
            </p>         
          </div>
        </div>
      </div>
    </div>
  );
}
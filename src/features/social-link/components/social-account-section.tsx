import { Button } from "@/shared/components/button";
import TextSeperator from "@/shared/components/text-separator";
import { GoogleLogo } from "@/shared/components/logos";
import { useSocialLinks } from "@/features/social-link/hooks/use-social-links";
import { useSocialAccountUnlink } from "@/features/social-link/hooks/use-social-account";
import { Check, X } from "lucide-react";

type SocialProvider = {
  name: string;
  displayName: string;
  logo: React.ReactNode;
  color: string;
};

const socialProviders: SocialProvider[] = [
  // {
  //   name: "kakao",
  //   displayName: "Kakao",
  //   logo: <KakaoLogo width={16} height={16} fill="#3c1e1e" />,
  //   color: "#FEE500",
  // },
  {
    name: "google",
    displayName: "Google",
    logo: <GoogleLogo width={16} height={16} fill="#ddd" />,
    color: "#0062ff",
  },
  // {
  //   name: "github",
  //   displayName: "Github",
  //   logo: <GithubLogo width={16} height={16} />,
  //   color: "#24292e",
  // },
];

const SocialAccountSection = () => {
  const { data: socialLinksData, isLoading } = useSocialLinks();
  // const { mutate: linkAccount } = useSocialAccountLink();
  const { mutate: unlinkAccount, isPending: isUnlinking } =
    useSocialAccountUnlink();

  const handleSocialButtonClick = (provider: SocialProvider) => {
    const linkedAccount = socialLinksData?.socialLinks.find(
      (link) => link.provider.toLowerCase() === provider.name.toLowerCase(),
    );

    if (linkedAccount) {
      // 연동 해제
      if (
        window.confirm(`${provider.displayName} 계정 연동을 해제하시겠습니까?`)
      ) {
        unlinkAccount(linkedAccount.socialLinkId);
      }
    } else {
      // 연동
      // linkAccount(provider.name);
    }
  };

  const isProviderLinked = (providerName: string) => {
    return socialLinksData?.socialLinks.some(
      (link) => link.provider.toLowerCase() === providerName.toLowerCase(),
    );
  };

  if (isLoading) {
    return (
      <div className="mt-4 space-y-4">
        <TextSeperator>소셜계정 연동하기</TextSeperator>
        <div className="flex gap-2 justify-center">
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <TextSeperator>소셜계정 연동하기</TextSeperator>
      <div className="flex gap-2 justify-center flex-wrap">
        {socialProviders.map((provider) => {
          const isLinked = isProviderLinked(provider.name);

          if (!isLinked)
            return (
              <Button asChild>
                <a
                  className="flex items-center gap-2 min-w-30"
                  href={`${new URL(import.meta.env.VITE_BASE_URL).origin}/oauth2/authorization/google`}
                >
                  구글 연동하기
                </a>
              </Button>
            );
          return (
            <Button
              key={provider.name}
              variant={"default"}
              className="flex items-center gap-2 min-w-30"
              style={
                isLinked
                  ? {
                      backgroundColor: provider.color,
                      color: provider.name === "kakao" ? "#3c1e1e" : "#fff",
                    }
                  : undefined
              }
              onClick={() => handleSocialButtonClick(provider)}
              disabled={isUnlinking}
            >
              {provider.logo}
              <span>{provider.displayName}</span>
              {isLinked ? (
                <Check className="w-4 h-4 ml-auto" />
              ) : (
                <X className="w-4 h-4 ml-auto opacity-0" />
              )}
            </Button>
          );
        })}
      </div>
      {socialLinksData?.socialLinks &&
        socialLinksData.socialLinks.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            <p>연동된 계정을 클릭하면 연동을 해제할 수 있습니다.</p>
          </div>
        )}
    </div>
  );
};

export default SocialAccountSection;

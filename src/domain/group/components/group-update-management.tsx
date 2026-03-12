import GroupDeleteDialog from "@/domain/group/components/group-delete-dialog";
import GroupForm, {
  type GroupFormField,
} from "@/domain/group/components/group-form";
import { useGroupDetail } from "@/domain/group/hooks/use-group-detail";
import { groupApi, type GroupPutRequest } from "@/shared/apis";
import { Separator } from "@/shared/components/separator";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Props = {
  groupId: number;
};

export const GroupUpdateManagement = ({ groupId }: Props) => {
  const queryClient = useQueryClient();
  const { data: groupData, isLoading } = useGroupDetail(groupId);

  const { mutate, isPending } = useMutation({
    mutationFn: ({
      groupId,
      data,
    }: {
      groupId: number;
      data: GroupPutRequest;
    }) => groupApi.updateGroup(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      window.alert("그룹 정보가 수정되었습니다.");
    },
    onError: () => {
      window.alert("그룹 정보 수정에 실패했습니다. 다시 시도해주세요.");
    },
  });

  const handleSubmit = (form: GroupFormField) => {
    const data: GroupPutRequest = {
      name: form.name,
      category: form.category,
      description: form.description,
      joinPolicy: form.applicationRequired ? "APPROVAL" : "OPEN",
      visibility: form.publicVisible ? "PUBLIC" : "PRIVATE",
      maxMember: form.maxMember,
      imageRefId: form.imageRefId,
    };

    mutate({ groupId, data });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!groupData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">그룹 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const defaultValues: Partial<GroupFormField> = {
    name: groupData.name,
    category: groupData.category,
    description: groupData.description,
    applicationRequired: groupData.applicationRequired,
    publicVisible: groupData.publicVisible,
    maxMember: groupData.maxMember,
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">그룹 정보 수정</h2>
        <p className="text-gray-600 text-sm mt-1">
          그룹의 기본 정보를 수정할 수 있습니다.
        </p>
      </div>
      <GroupForm
        formId="group-update-form"
        onSubmit={handleSubmit}
        defaultValues={defaultValues}
        submitButtonText={isPending ? "수정 중..." : "수정하기"}
        showResetButton={false}
      />
      <Separator className="my-8" />
      <GroupDeleteDialog groupId={groupId} />
    </div>
  );
};

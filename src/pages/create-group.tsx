import type { GroupCategory } from "@/shared/apis";
import { Button } from "@/shared/components/button";
import { Checkbox } from "@/shared/components/checkbox";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import { useForm } from "react-hook-form";

type FormType = {
  name: string;
  category: GroupCategory;
  description: string;
  applicationRequired: boolean;
  publicVisible: boolean;
  maxMember: number;
  image: string;
};

const CreateGroup = () => {
  const { register } = useForm<FormType>();

  return (
    <form>
      <div>
        <Label htmlFor="name">그룹명</Label>
        <Input id="name" {...register("name")}></Input>
      </div>
      <div>
        <Label htmlFor="category">카테고리</Label>
        <Input id="category" {...register("category")}></Input>
      </div>
      <div>
        <Label htmlFor="description">그룹 설명</Label>
        <Input id="description" {...register("description")}></Input>
      </div>
      <div>
        <Label htmlFor="applicationRequired">가입신청 여부</Label>
        <Checkbox
          className="h-8"
          id="applicationRequired"
          {...register("applicationRequired")}
        ></Checkbox>
      </div>
      <div>
        <Label htmlFor="publicVisible">공개</Label>
        <Input id="publicVisible" {...register("publicVisible")}></Input>
      </div>
      <div>
        <Label htmlFor="maxMember">최대 인원</Label>
        <Input type="number" id="maxMember" {...register("maxMember")}></Input>
      </div>
      <div>
        <Label htmlFor="image">이미지</Label>
        <Input id="image" type="file" />
      </div>

      <Button type="submit">생성하기</Button>
    </form>
  );
};

export default CreateGroup;

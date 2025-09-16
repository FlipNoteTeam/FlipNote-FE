import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import { useForm } from "react-hook-form";

const CreateGroup = () => {
  const {} = useForm();
  return (
    <form>
      <div>
        <Label htmlFor=""></Label>
        <Input id=""></Input>
      </div>
    </form>
  );
};

export default CreateGroup;

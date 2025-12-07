import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { inviteMemberSchema, InviteMemberSchemaType } from "@/app/schemas/member";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";

export default function InviteMember() {
    const [Open, setOpen] = useState(false);

    const form = useForm({
        resolver: zodResolver(inviteMemberSchema),
        defaultValues: {
            email: "",
            name: "",
        }
    })

    const inviteMutation = useMutation(
        orpc.workspace.member.invite.mutationOptions({
            onSuccess: () => {
                toast.success("Invitation sent successfully!");

                form.reset();

                setOpen(false);
            },
            onError: (error) => {
                console.log(error);
                toast.error(error.message)
            }
        })
    )

    function onSubmit(values: InviteMemberSchemaType) {
        inviteMutation.mutate(values);
    }

    return (
        <Dialog open={Open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="dark:invert-20"
                >
                    <UserPlus />
                    Invite Member
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite Member</DialogTitle>
                    <DialogDescription>Connect your team members via email</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Member Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter member name..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter email address..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit">
                            Send Invitation
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

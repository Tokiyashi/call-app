"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import authImg from "@/public/authbird.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/db/main";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Label } from "@/components/ui/label";

export default function Page() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const form = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const handleSubmit = async () => {
    console.log("12121");

    await createUserWithEmailAndPassword(
      auth,
      form.getValues("email"),
      form.getValues("password")
    )
      .then(() => {
        if (auth.currentUser)
          updateProfile(auth.currentUser, {
            displayName: form.getValues("username"),
          });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  };

  return (
    <div className="flex min-h-screen flex-col items-start gap-5 justify-start p-24">
      <h1 className="text-3xl mb-7 font-bold">
        {isRegisterMode ? "Регистрация" : "Вход"}
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="flex flex-col gap-5">
            {isRegisterMode && (
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Псевдоним</FormLabel>
                    <FormControl>
                      <Input placeholder="Yasosubebru2002" {...field} />
                    </FormControl>
                    <FormDescription>
                      Это ваше публично отображающееся имя
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Адрес электронной почты</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="ilikebobaterry@gmail.com"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пароль</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">Начать болтовню!</Button>
          </div>
        </form>
      </Form>
      <div className="flex gap-2 items-center">
        <Switch
          id="reg-mode"
          onCheckedChange={(val) => setIsRegisterMode(val)}
        />
        <Label htmlFor="reg-mode">Регистрация</Label>
      </div>
      <Image
        src={authImg}
        className="h-screen absolute top-0 max-w-screen-md right-0"
        alt="auth"
      />
    </div>
  );
}
